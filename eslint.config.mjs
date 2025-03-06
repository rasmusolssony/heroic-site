import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'prettier',
  ),
  {
    ignores: ['node_modules', '.husky', '.next'],
    rules: { "@typescript-eslint/no-empty-object-type": "off" },
    settings: {
      react: { "version": "detect" }
    }
  },
];

export default eslintConfig;
