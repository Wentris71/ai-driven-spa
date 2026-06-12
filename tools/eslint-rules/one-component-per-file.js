"use strict";

function returnsJSX(fnNode) {
  let result = false;
  function walk(node) {
    if (result || !node || typeof node.type !== "string") return;
    if (node.type === "JSXElement" || node.type === "JSXFragment") {
      result = true;
      return;
    }
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

function isTopLevel(node) {
  const p = node.type === "FunctionDeclaration" ? node.parent : node.parent;
  return p && (p.type === "Program" || p.type === "ExportNamedDeclaration");
}

module.exports = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      tooMany: "Only one component per file — move `{{name}}` to its own file.",
    },
  },
  create(context) {
    const components = [];
    function consider(name, fnNode, reportNode) {
      if (!name || !/^[A-Z]/.test(name)) return;
      if (!returnsJSX(fnNode)) return;
      components.push({ name, reportNode });
    }
    return {
      FunctionDeclaration(node) {
        if (!isTopLevel(node)) return;
        consider(node.id && node.id.name, node, node.id || node);
      },
      VariableDeclarator(node) {
        const decl = node.parent;
        if (!decl || decl.type !== "VariableDeclaration") return;
        const top = decl.parent;
        if (
          !top ||
          (top.type !== "Program" && top.type !== "ExportNamedDeclaration")
        ) {
          return;
        }
        const init = node.init;
        if (
          init &&
          (init.type === "ArrowFunctionExpression" ||
            init.type === "FunctionExpression")
        ) {
          consider(node.id && node.id.name, init, node.id);
        }
      },
      "Program:exit"() {
        components.slice(1).forEach((c) => {
          context.report({
            node: c.reportNode,
            messageId: "tooMany",
            data: { name: c.name },
          });
        });
      },
    };
  },
};
