import { defineConfig } from 'eslint/config';

// Import TypeScript ESLint config from Electron Toolkit
import tseslint from '@electron-toolkit/eslint-config-ts';

// Import Prettier config for ESLint to disable conflicting rules
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier';

// Import React ESLint plugin
import eslintPluginReact from 'eslint-plugin-react';

// Import React Hooks ESLint plugin
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

// Import React Refresh plugin for fast refresh support in dev
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

// Import simple import sort plugin (not used in this config but available if needed)
// import simpleImportSort from 'eslint-plugin-simple-import-sort';

// Export the ESLint config using the Electron Toolkit's base TS config
export default defineConfig(
  // Ignore common build and dependency folders
  { ignores: ['**/node_modules', '**/dist', '**/out'] },

  // Include recommended rules from the TypeScript ESLint config
  tseslint.configs.recommended,

  // Use React plugin's recommended rules
  eslintPluginReact.configs.flat.recommended,

  // Add support for the JSX runtime (React 17+)
  eslintPluginReact.configs.flat['jsx-runtime'],

  // Configure React plugin to detect the installed React version
  {
    settings: {
      react: {
        version: 'detect' // Automatically picks the React version from package.json
      }
    }
  },

  // Apply additional rules to TypeScript and TSX files
  {
    files: ['**/*.{ts,tsx}'], // Target all TypeScript and TSX files
    plugins: {
      'react-hooks': eslintPluginReactHooks, // Add hooks plugin
      'react-refresh': eslintPluginReactRefresh // Add React Fast Refresh plugin
      // 'simple-import-sort': simpleImportSort // Add simple import sort plugin
    },
    rules: {
      // Use recommended rules for React Hooks
      ...eslintPluginReactHooks.configs.recommended.rules,
      // Use Vite-specific rules for React Refresh (Fast Refresh)
      ...eslintPluginReactRefresh.configs.vite.rules

      // 'simple-import-sort/imports': [
      //   'error',
      //   {
      //     groups: [
      //       // Node builtins and external npm packages
      //       ['^node:', '^@?\\w'],
      //       // Side effect imports
      //       ['^\\u0000'],
      //       // Project absolute imports: adjust for '@' alias and key folders
      //       ['^@/(assets|components|hooks|pages|redux|services|theme|utils)(/.*|$)'],
      //       // Shared modules
      //       ['^src/shared(/.*|$)'],
      //       // Relative imports (parent, sibling, index)
      //       ['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
      //       // Style imports
      //       ['^.+\\.s?css$']
      //     ]
      //   }
      // ],
      // // Sort named members inside import {...}
      // 'simple-import-sort/exports': 'error'
    }
  },

  // Apply Prettier config to disable conflicting formatting rules
  eslintConfigPrettier
);
