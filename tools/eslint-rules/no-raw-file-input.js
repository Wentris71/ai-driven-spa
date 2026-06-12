/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid raw <input type="file"> in admin scope. Use <ImageField> or <ImageCollectionField> from @/components/ui.',
    },
    schema: [],
    messages: {
      noRaw:
        'Use <ImageField> or <ImageCollectionField> from @/components/ui instead of raw <input type="file">.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!node.name || node.name.type !== 'JSXIdentifier') return;
        if (node.name.name !== 'input') return;
        const typeAttr = (node.attributes || []).find(
          (a) =>
            a.type === 'JSXAttribute' &&
            a.name &&
            a.name.name === 'type' &&
            a.value &&
            a.value.type === 'Literal' &&
            a.value.value === 'file',
        );
        if (typeAttr) context.report({node, messageId: 'noRaw'});
      },
    };
  },
};
