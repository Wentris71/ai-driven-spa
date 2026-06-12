const COMMON_KEYS = new Set([
  'cancel',
  'save',
  'delete',
  'edit',
  'add',
  'remove',
  'back',
  'close',
  'confirm',
  'loading',
  'search',
  'yes',
  'no',
  'submit',
  'reset',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Generic UI keys live under common.*, not under feature namespaces.',
    },
    schema: [],
    messages: {
      useCommon:
        'Key "{{key}}" is generic — use useTranslations("common") instead of a feature namespace.',
    },
  },
  create(context) {
    const tBindings = new Map(); // varName -> namespace
    return {
      VariableDeclarator(node) {
        if (
          node.init?.type === 'CallExpression' &&
          node.init.callee?.name === 'useTranslations' &&
          node.init.arguments[0]?.type === 'Literal' &&
          node.id.type === 'Identifier'
        ) {
          tBindings.set(node.id.name, String(node.init.arguments[0].value));
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          tBindings.has(node.callee.name) &&
          node.arguments[0]?.type === 'Literal'
        ) {
          const ns = tBindings.get(node.callee.name);
          if (ns === 'common') return;
          const key = String(node.arguments[0].value);
          if (COMMON_KEYS.has(key)) {
            context.report({node, messageId: 'useCommon', data: {key}});
          }
        }
      },
    };
  },
};
