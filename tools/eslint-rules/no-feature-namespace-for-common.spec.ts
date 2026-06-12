/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./no-feature-namespace-for-common.js');

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

tester.run('no-feature-namespace-for-common', rule, {
  valid: [
    `const t = useTranslations('common'); t('cancel');`,
    `const t = useTranslations('admin.users'); t('table.name');`,
  ],
  invalid: [
    {
      code: `const t = useTranslations('admin.users'); t('cancel');`,
      errors: [{messageId: 'useCommon'}],
    },
    {
      code: `const t = useTranslations('admin.tours'); t('save');`,
      errors: [{messageId: 'useCommon'}],
    },
  ],
});
