/** @type {import('eslint').Rule.RuleModule} */
const DESTRUCTIVE = /^(Delete|Remove|Archive|Unpublish|Discard|Reset)\b/i;
const DANGER_VARIANTS = new Set(['danger', 'ghost-danger']);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Destructive button labels must use variant="danger" or "ghost-danger".',
    },
    schema: [],
    messages: {
      destructiveNotDanger:
        'Destructive button label requires variant="danger" or "ghost-danger".',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (node.openingElement.name.name !== 'Button') return;
        // Navigation buttons (href present) are never destructive actions.
        const hrefAttr = node.openingElement.attributes.find(
          (a) => a.type === 'JSXAttribute' && a.name && a.name.name === 'href',
        );
        if (hrefAttr) return;
        const variantAttr = node.openingElement.attributes.find(
          (a) =>
            a.type === 'JSXAttribute' && a.name && a.name.name === 'variant',
        );
        const variant =
          variantAttr &&
          variantAttr.value &&
          variantAttr.value.type === 'Literal'
            ? variantAttr.value.value
            : null;
        const label = (node.children || [])
          .map((c) => (c.type === 'JSXText' ? c.value : ''))
          .join('')
          .trim();
        if (DESTRUCTIVE.test(label) && !DANGER_VARIANTS.has(variant)) {
          context.report({node, messageId: 'destructiveNotDanger'});
        }
      },
    };
  },
};
