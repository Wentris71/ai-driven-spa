"use strict";

function bodyReturnsJSX(fnNode) {
  let result = false;
  function walk(node) {
    if (result || !node || typeof node.type !== "string") return;
    if (node.type === "JSXElement" || node.type === "JSXFragment") {
      result = true;
      return;
    }
    // Do not descend into nested functions — their JSX is their own.
    if (
      node !== fnNode &&
      (node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression")
    ) {
      return;
    }
    for (const key of Object.keys(node)) {
      if (key === "parent") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) if (c && typeof c.type === "string") walk(c);
      } else if (child && typeof child.type === "string") {
        walk(child);
      }
    }
  }
  walk(fnNode.body);
  return result;
}

module.exports = {
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    messages: {
      useConst:
        "Components must be declared as `export const`, not `export function`.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    return {
      "ExportNamedDeclaration > FunctionDeclaration"(node) {
        const name = node.id && node.id.name;
        if (!name || !/^[A-Z]/.test(name)) return; // components are PascalCase
        if (!bodyReturnsJSX(node)) return; // only JSX-returning functions
        context.report({
          node: node.id,
          messageId: "useConst",
          fix(fixer) {
            if (node.typeParameters) return null; // generics: report-only
            const head = sourceCode.text
              .slice(node.id.range[1], node.body.range[0])
              .trimEnd();
            const asyncPrefix = node.async ? "async " : "";
            return fixer.replaceTextRange(
              [node.range[0], node.body.range[0]],
              `const ${name} = ${asyncPrefix}${head} => `,
            );
          },
        });
      },
    };
  },
};
