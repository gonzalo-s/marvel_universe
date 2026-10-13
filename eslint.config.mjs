import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Atomic layers depend downwards; pages/templates compose the UI.
  ...[
    { files: ['src/components/atoms/**/*.{ts,tsx}'], blocked: ['@/components/molecules/**', '@/components/organisms/**', '@/components/templates/**', '../molecules/**', '../organisms/**', '../templates/**', '@/hooks/**', '@/services/**', '@/data/**'] },
    { files: ['src/components/molecules/**/*.{ts,tsx}'], blocked: ['@/components/organisms/**', '@/components/templates/**', '../organisms/**', '../templates/**'] },
    { files: ['src/components/organisms/**/*.{ts,tsx}'], blocked: ['@/components/templates/**', '../templates/**', '../../templates/**'] },
    { files: ['src/hooks/**/*.{ts,tsx}'], blocked: ['@/components/**', '../components/**'] },
  ].map(({ files, blocked }) => ({ files, rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: blocked, message: 'Import lower atomic layers or shared domain modules; do not depend on higher UI layers.' },
      { group: ['@/services/**/server', '**/services/**/server'], message: 'Server integrations belong in app pages/API handlers, not client UI or hooks.' },
    ] }],
  } })),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
