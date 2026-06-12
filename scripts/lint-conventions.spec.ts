import {findMissingFormUtils} from './lint-conventions';

describe('findMissingFormUtils', () => {
  const exists = (present: string[]) => (f: string) => present.includes(f);

  it('flags a form component without a co-located form-utils sibling', () => {
    const files = ['src/components/Contact/ContactForm.tsx'];
    const read = () => `const {register} = useForm();`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual(files);
  });

  it('passes when the sibling form-utils file exists', () => {
    const files = ['src/components/Contact/ContactForm.tsx'];
    const read = () => `<form onSubmit={onSubmit}>`;
    const sibling = 'src/components/Contact/ContactForm.form-utils.ts';
    expect(findMissingFormUtils(files, read, exists([sibling]))).toEqual([]);
  });

  it('passes when the file imports a shared form-utils module', () => {
    const files = ['src/components/Contact/ContactEditor.tsx'];
    const read = () =>
      `import {schema} from './ContactForm.form-utils';\nconst f = useForm();`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual([]);
  });

  it('ignores files without forms', () => {
    const files = ['src/components/Card/Card.tsx'];
    const read = () => `export const Card = () => <div />;`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual([]);
  });
});
