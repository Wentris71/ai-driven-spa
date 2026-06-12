"use strict";

const INTERACTIVE_TAGS = new Set(["button", "a", "select"]);

function attr(node, name) {
  return node.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name && a.name.name === name,
  );
}

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: [],
    messages: {
      missing: "Interactive element must have the `cursor-pointer` class.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const tag = node.name.name;
        // Only police native (lowercase) elements. Custom components
        // (PascalCase, e.g. <Button>) own their own cursor styling.
        if (/^[A-Z]/.test(tag)) return;
        const hasOnClick = !!attr(node, "onClick");
        const htmlFor = !!attr(node, "htmlFor");
        const typeAttr = attr(node, "type");
        const inputType =
          typeAttr && typeAttr.value && typeAttr.value.type === "Literal"
            ? typeAttr.value.value
            : null;

        const interactive =
          INTERACTIVE_TAGS.has(tag) ||
          hasOnClick ||
          (tag === "label" && htmlFor) ||
          (tag === "input" &&
            (inputType === "checkbox" || inputType === "radio"));
        if (!interactive) return;

        const className = attr(node, "className");
        // No className at all on an interactive element → flag.
        if (!className) {
          context.report({ node, messageId: "missing" });
          return;
        }
        // Dynamic className (cn()/clsx()/variable) → cannot resolve, skip.
        if (
          !className.value ||
          className.value.type !== "Literal" ||
          typeof className.value.value !== "string"
        ) {
          return;
        }
        const classes = className.value.value.split(/\s+/);
        if (!classes.includes("cursor-pointer")) {
          context.report({
            node,
            messageId: "missing",
            fix(fixer) {
              const raw = sourceCode.getText(className.value);
              const quote = raw[0];
              if (quote !== '"' && quote !== "'") return null;
              const inner = raw.slice(1, -1);
              return fixer.replaceText(
                className.value,
                quote + inner + " cursor-pointer" + quote,
              );
            },
          });
        }
      },
    };
  },
};
