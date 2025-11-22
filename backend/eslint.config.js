import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginJs from '@eslint/js';

export default [pluginJs.configs.recommended, eslintConfigPrettier];
