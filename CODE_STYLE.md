# Code Style Guide

This project uses **ESLint** and **Prettier** to maintain consistent code quality and formatting.

## Tools Configured

### Prettier
- **Purpose**: Code formatting (indentation, quotes, spacing, etc.)
- **Config File**: `.prettierrc`
- **Ignore File**: `.prettierignore`

### ESLint
- **Purpose**: Code quality and bug detection
- **Config File**: `eslint.config.js` (ESLint v9 flat config)
- **Version**: ESLint 9.x with TypeScript support

## Quick Commands

### Format Code with Prettier
```bash
npm run format
```
Formats all TypeScript files in the `src/` directory.

### Lint Code with ESLint
```bash
npm run lint
```
Checks and automatically fixes linting issues.

## Prettier Configuration

```json
{
  "singleQuote": true,           // Use single quotes
  "trailingComma": "all",        // Add trailing commas
  "tabWidth": 2,                 // 2 spaces for indentation
  "semi": true,                  // Use semicolons
  "printWidth": 100,             // Max line length 100 chars
  "arrowParens": "always",       // Always use parens for arrow functions
  "endOfLine": "lf"              // Unix line endings
}
```

## ESLint Rules

Key rules enabled:
- **TypeScript ESLint**: Recommended TypeScript rules
- **No explicit any warnings**: Allowed for flexibility
- **Unused variables**: Warnings (except when prefixed with `_`)
- **Explicit return types**: Optional for cleaner code

### Disabled Rules
- `@typescript-eslint/interface-name-prefix` - No need to prefix interfaces with "I"
- `@typescript-eslint/explicit-function-return-type` - Return types are optional
- `@typescript-eslint/explicit-module-boundary-types` - Boundary types are optional
- `@typescript-eslint/no-explicit-any` - Allow `any` type when needed

## IDE Integration

### VS Code (Cursor)
1. Install extensions:
   - **ESLint** (dbaeumer.vscode-eslint)
   - **Prettier** (esbenp.prettier-vscode)

2. Add to your `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Pre-commit Hooks (Optional)

To automatically format and lint before commits, install Husky:

```bash
npm install -D husky lint-staged
npx husky install
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "src/**/*.ts": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

## Ignored Files

The following are ignored by both ESLint and Prettier:
- `node_modules/`
- `dist/`
- `coverage/`
- `pms-main/` (legacy project)
- `*.config.js` files
- `package-lock.json`

## Best Practices

1. **Run format before committing**:
   ```bash
   npm run format
   ```

2. **Check for linting issues**:
   ```bash
   npm run lint
   ```

3. **Fix issues automatically**: Both Prettier and ESLint will fix most issues automatically

4. **Commit formatted code**: Always commit code that's been formatted and linted

## Troubleshooting

### ESLint not working?
```bash
# Clear ESLint cache
rm -rf .eslintcache
npm run lint
```

### Prettier not formatting?
```bash
# Check Prettier version
npx prettier --version

# Format specific file
npx prettier --write src/path/to/file.ts
```

### Conflicts between ESLint and Prettier?
The configuration is set up to avoid conflicts. ESLint handles code quality, Prettier handles formatting.

