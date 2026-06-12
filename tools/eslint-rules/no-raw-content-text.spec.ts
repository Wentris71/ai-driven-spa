/**
 * @jest-environment node
 */
import {RuleTester} from 'eslint';
const tsParser = require('@typescript-eslint/parser');
const rule = require('./no-raw-content-text.js');

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2021,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

tester.run('no-raw-content-text', rule, {
  valid: [
    // i18n call as JSX child
    `const X = () => <p>{t('hello')}</p>;`,
    // dynamic content as JSX child
    `const X = ({item}) => <p>{item.title}</p>;`,
    // i18n call as attr value
    `const X = () => <img alt={t('logo')} />;`,
    // dynamic attr value
    `const X = ({item}) => <button title={item.title} />;`,
    // pure punctuation / separator text
    `const X = () => <span> · </span>;`,
    `const X = () => <span>—</span>;`,
    // arrows / symbols
    `const X = () => <span>→</span>;`,
    `const X = () => <span>←</span>;`,
    `const X = () => <span>×</span>;`,
    `const X = () => <span>•</span>;`,
    `const X = () => <span>✓</span>;`,
    // currency / digits / time markers
    `const X = () => <span>$</span>;`,
    `const X = () => <span>$5</span>;`,
    `const X = () => <span>404</span>;`,
    `const X = () => <span>4:31</span>;`,
    `const X = () => <span>01 ·</span>;`,
    // short tech tokens (locale, unit, ARIA role literal)
    `const X = () => <span>VI</span>;`,
    `const X = () => <span>EN</span>;`,
    `const X = () => <span>km</span>;`,
    `const X = () => <span>min</span>;`,
    `const X = () => <span>max</span>;`,
    `const X = () => <span>dialog</span>;`,
    // whitespace only
    `const X = () => <p>   </p>;`,
    // numeric child
    `const X = () => <p>{42}</p>;`,
    // template with interpolation
    `const X = ({n}) => <p>{\`Count: \${n}\`}</p>;`,
    // non-content attr literal is fine
    `const X = () => <button type="submit" />;`,
    `const X = () => <input name="email" />;`,
    `const X = () => <img src="/x.png" />;`,
    // empty attr string
    `const X = () => <img alt="" />;`,
  ],
  invalid: [
    {
      code: `const X = () => <p>Hello world</p>;`,
      errors: [{messageId: 'rawJsxText'}],
    },
    {
      code: `const X = () => <img alt="Company logo" />;`,
      errors: [{messageId: 'rawAttr'}],
    },
    {
      code: `const X = () => <button title="Click me" />;`,
      errors: [{messageId: 'rawAttr'}],
    },
    {
      code: `const X = () => <input placeholder="Search" />;`,
      errors: [{messageId: 'rawAttr'}],
    },
    {
      code: `const X = () => <button aria-label="Close" />;`,
      errors: [{messageId: 'rawAttr'}],
    },
    {
      code: `const X = () => <p>{'Hi there'}</p>;`,
      errors: [{messageId: 'rawJsxText'}],
    },
    {
      code: `const X = () => <p>{\`Hi there\`}</p>;`,
      errors: [{messageId: 'rawJsxText'}],
    },
    {
      code: `const X = () => <img alt={'Logo'} />;`,
      errors: [{messageId: 'rawAttr'}],
    },
    {
      code: `const X = () => <img alt={\`Logo\`} />;`,
      errors: [{messageId: 'rawAttr'}],
    },
  ],
});
