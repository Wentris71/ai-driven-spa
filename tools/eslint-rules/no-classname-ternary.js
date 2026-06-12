"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      ternary:
        "No ternary inside a `className` template literal. Use `cn()` (object form) for ad-hoc joins, or a `data-*` attribute for a pure visual toggle. See docs/superpowers/specs/2026-06-03-tailwind-styling-primitives-design.md",
    },
  },
  create(context) {
    return {
      // A conditional expression nested in a template literal that is the
      // value of a className attribute — the exact anti-pattern the cn()/tv()/
      // data-* approach replaces.
      "JSXAttribute[name.name='className'] TemplateLiteral ConditionalExpression"(
        node,
      ) {
        context.report({node, messageId: "ternary"});
      },
    };
  },
};
