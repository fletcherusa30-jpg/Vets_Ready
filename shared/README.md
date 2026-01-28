# shared/

This folder is for code, types, or documentation shared across multiple modules or services in the project.

## Contents

- **types/** - TypeScript/Python type definitions shared across platforms
- **constants/** - Application constants (status codes, enums, etc.)
- **utils/** - Shared utility functions
- **schemas/** - Zod schemas for validation (used by both FE and BE)

## Usage Guidelines
- Store language-agnostic shared code (e.g., TypeScript types, Python modules, shared markdown docs).
- Do not place module-specific code here.
- Document all shared interfaces and update when changes are made.
- This folder contains code that should be consistent across all Vets Ready applications to ensure data integrity and consistent behavior.

---

**Policy:** All shared code must be linted, type-checked, and documented.
