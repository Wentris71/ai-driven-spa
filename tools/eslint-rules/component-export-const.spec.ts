/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';

const tsParser = require('@typescript-eslint/parser');

const rule = require('./component-export-const.js');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('component-export-const', rule, {
  valid: [
    {code: 'export const Foo = () => <div />;'},
    {code: 'export function helper() { return 1; }'}, // not a component
    {code: 'export function useThing() { return 2; }'}, // hook, lowercase
    {code: 'function Inner() { return <span/>; }'}, // not exported
  ],
  invalid: [
    {
      code: 'export function Foo() { return <div />; }',
      output: 'export const Foo = () => { return <div />; }',
      errors: [{messageId: 'useConst'}],
    },
    {
      // generic component: reported but NOT auto-fixed
      code: 'export function Box<T>(p: {v: T}) { return <div />; }',
      output: null,
      errors: [{messageId: 'useConst'}],
    },
  ],
});
