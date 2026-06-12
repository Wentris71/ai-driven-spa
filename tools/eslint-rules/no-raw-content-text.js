'use strict';

const DEFAULT_CONTENT_ATTRS = new Set([
  'alt',
  'title',
  'placeholder',
  'label',
  'description',
  'helperText',
  'errorMessage',
  'tooltip',
  'caption',
  'summary',
  'heading',
  'subheading',
  'subtitle',
  'confirmLabel',
  'cancelLabel',
  'ctaLabel',
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-valuetext',
  'aria-roledescription',
]);

// Any combination of punctuation, symbols, currency, math, arrows, dingbats,
// digits and whitespace is considered presentational, not user-visible text.
// (Unicode P + S property classes + digits.)
const NON_TEXTUAL_ONLY = /^[\p{P}\p{S}\p{N}\s]+$/u;

// Literal short tokens that are technical/abbreviational, not translatable
// content: locale codes, units, codenames, ARIA roles passed as plain values,
// placeholder time/duration markers.
const IGNORED_LITERALS = new Set([
  'VI',
  'EN',
  'vi',
  'en',
  'km',
  'cc',
  'USD',
  'EUR',
  'VND',
  'kg',
  'min',
  'max',
  'dialog',
  'alertdialog',
  'menu',
  'listbox',
  'tab',
  'tabpanel',
  'tablist',
]);

function isAllowedText(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (NON_TEXTUAL_ONLY.test(trimmed)) return true;
  if (IGNORED_LITERALS.has(trimmed)) return true;
  return false;
}

function attrName(node) {
  if (node.name.type === 'JSXNamespacedName') {
    return `${node.name.namespace.name}:${node.name.name.name}`;
  }
  return node.name.name;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'No raw user-visible text — wrap content (JSX text, alt, title, label, placeholder, etc.) with useTranslations.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          attrs: {type: 'array', items: {type: 'string'}},
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawJsxText:
        'Raw user-visible text "{{text}}" — wrap with t(...) from useTranslations.',
      rawAttr:
        'Raw text on `{{attr}}` — use t(...) from useTranslations instead of a string literal.',
    },
  },
  create(context) {
    const opts = context.options[0] || {};
    const attrs = new Set([
      ...DEFAULT_CONTENT_ATTRS,
      ...(opts.attrs || []),
    ]);

    function reportJsxText(node, text) {
      context.report({
        node,
        messageId: 'rawJsxText',
        data: {text: text.trim().slice(0, 40)},
      });
    }

    function checkStringValue(node, name, raw) {
      if (!raw.trim()) return;
      context.report({node, messageId: 'rawAttr', data: {attr: name}});
    }

    return {
      JSXText(node) {
        if (isAllowedText(node.value)) return;
        reportJsxText(node, node.value);
      },

      Literal(node) {
        if (typeof node.value !== 'string') return;
        if (!node.parent || node.parent.type !== 'JSXExpressionContainer') {
          return;
        }
        const host = node.parent.parent;
        if (
          host &&
          (host.type === 'JSXElement' || host.type === 'JSXFragment')
        ) {
          if (isAllowedText(node.value)) return;
          reportJsxText(node, node.value);
        }
      },

      TemplateLiteral(node) {
        if (!node.parent || node.parent.type !== 'JSXExpressionContainer') {
          return;
        }
        const host = node.parent.parent;
        if (
          !host ||
          (host.type !== 'JSXElement' && host.type !== 'JSXFragment')
        ) {
          return;
        }
        if (node.expressions.length > 0) return;
        const text = node.quasis.map((q) => q.value.raw).join('');
        if (isAllowedText(text)) return;
        reportJsxText(node, text);
      },

      JSXAttribute(node) {
        const name = attrName(node);
        if (!attrs.has(name)) return;
        const val = node.value;
        if (!val) return;
        if (val.type === 'Literal' && typeof val.value === 'string') {
          checkStringValue(node, name, val.value);
          return;
        }
        if (val.type !== 'JSXExpressionContainer') return;
        const expr = val.expression;
        if (expr.type === 'Literal' && typeof expr.value === 'string') {
          checkStringValue(node, name, expr.value);
          return;
        }
        if (expr.type === 'TemplateLiteral' && expr.expressions.length === 0) {
          const text = expr.quasis.map((q) => q.value.raw).join('');
          checkStringValue(node, name, text);
        }
      },
    };
  },
};
