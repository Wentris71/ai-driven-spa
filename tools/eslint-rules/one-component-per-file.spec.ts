/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./one-component-per-file.js');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('one-component-per-file', rule, {
  valid: [
    {code: 'export const A = () => <div/>; const helper = () => 1;'},
    {code: 'function A() { return <div/>; }'},
    // nested helper component is not a top-level declaration
    {
      code: 'export const A = () => { const Inner = () => <i/>; return <Inner/>; };',
    },
  ],
  invalid: [
    {
      code: 'const A = () => <div/>; const B = () => <span/>;',
      errors: [{messageId: 'tooMany', data: {name: 'B'}}],
    },
    {
      code: 'function A() { return <div/>; }\nexport function B() { return <span/>; }',
      errors: [{messageId: 'tooMany', data: {name: 'B'}}],
    },
  ],
});
