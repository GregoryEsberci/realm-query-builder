module.exports = {
  env: {
    es2021: true,
  },

  extends: [
    'airbnb-base',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: [
    'jest',
    '@typescript-eslint',
  ],

  settings: {
    'import/resolver': {
      typescript: { },
      node: {
        extensions: ['.js', '.ts'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },

  rules: {
    'no-useless-constructor': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': 'off',

    'import/extensions': 'off',

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
  },
};
