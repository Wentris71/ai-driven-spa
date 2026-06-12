/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./no-raw-file-input.js');

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

tester.run('no-raw-file-input', rule, {
  valid: [
    `<ImageField value={null} onChange={() => {}} />`,
    `<input type="text" />`,
    `<input type="checkbox" />`,
    `<input />`,
  ],
  invalid: [
    {
      code: `<input type="file" />`,
      errors: [{messageId: 'noRaw'}],
    },
    {
      code: `<input type="file" accept="image/*" />`,
      errors: [{messageId: 'noRaw'}],
    },
  ],
});
