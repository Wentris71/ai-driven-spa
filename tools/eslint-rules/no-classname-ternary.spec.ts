/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./no-classname-ternary.js');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('no-classname-ternary', rule, {
  valid: [
    // static className
    {code: 'const x = <div className="a b" />;'},
    // cn() object form — the approved pattern
    {code: "const x = <div className={cn('a', {b: cond})} />;"},
    // data-* toggle — the approved pattern
    {
      code: 'const x = <div data-active={cond} className="a data-[active=true]:b" />;',
    },
    // ternary NOT in a className (e.g. a different prop) is allowed
    {code: "const x = <div title={cond ? 'x' : 'y'} />;"},
  ],
  invalid: [
    {
      code: "const x = <div className={`base ${cond ? 'x' : 'y'}`} />;",
      errors: [{messageId: 'ternary'}],
    },
    {
      code: "const x = <div className={`a ${p ? 'b' : ''} ${q ? 'c' : 'd'}`} />;",
      errors: [{messageId: 'ternary'}, {messageId: 'ternary'}],
    },
  ],
});
