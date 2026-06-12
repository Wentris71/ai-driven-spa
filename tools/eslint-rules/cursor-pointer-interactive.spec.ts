/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./cursor-pointer-interactive.js');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('cursor-pointer-interactive', rule, {
  valid: [
    {code: '<button className="px-2 cursor-pointer">x</button>;'},
    {code: '<div>plain</div>;'},
    {code: '<button className={cn("x")}>dyn</button>;'}, // dynamic → skipped
    {code: '<input type="text" className="x" />;'}, // text input not interactive here
    {code: '<Button onClick={f}>x</Button>;'}, // custom component owns its cursor
  ],
  invalid: [
    {
      code: '<button className="px-2">x</button>;',
      output: '<button className="px-2 cursor-pointer">x</button>;',
      errors: [{messageId: 'missing'}],
    },
    // no className → reported, not auto-fixed
    {
      code: '<a onClick={f}>x</a>;',
      output: null,
      errors: [{messageId: 'missing'}],
    },
    {
      code: '<input type="checkbox" className="x" />;',
      output: '<input type="checkbox" className="x cursor-pointer" />;',
      errors: [{messageId: 'missing'}],
    },
  ],
});
