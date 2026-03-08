module.exports = {
  extends: ['expo'],
  rules: {
    // Disable unused vars warning for parameters starting with _
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Disable setState in effect warning (not recommended)
    'react-hooks/set-state-in-effect': 'off',
    
    // Disable refs during render error (not recommended)
    'react-hooks/refs': 'off',
    
    // Disable exhaustive deps warning
    'react-hooks/exhaustive-deps': 'warn',
    
    // Allow unescaped entities in JSX
    'react/no-unescaped-entities': 'off',
  },
  overrides: [
    {
      files: [
        "**/*.test.js",
        "**/*.spec.js",
        "**/__tests__/**/*.[jt]s?(x)",
        "testSuite/**/*.[jt]s?(x)",
        "jest.setup.js"
      ],
      env: {
        jest: true,
      },
    },
  ],
};