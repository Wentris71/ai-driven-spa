/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./no-destructive-button-style.js');

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

tester.run('no-destructive-button-style', rule, {
  valid: [
    `<Button variant="danger">Delete</Button>`,
    `<Button variant="ghost-danger">Remove</Button>`,
    `<Button variant="primary">Save</Button>`,
    // Navigation buttons (href present) are not destructive actions.
    `<Button variant="secondary" href="/admin/archive">Archive (3)</Button>`,
  ],
  invalid: [
    {
      code: `<Button variant="primary">Delete</Button>`,
      errors: [{messageId: 'destructiveNotDanger'}],
    },
    {
      code: `<Button variant="ghost">Archive</Button>`,
      errors: [{messageId: 'destructiveNotDanger'}],
    },
  ],
});
