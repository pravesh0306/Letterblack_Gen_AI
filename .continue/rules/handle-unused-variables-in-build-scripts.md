---
globs: "**/*.ps1 (or .sh, depending on the file)"
description: Addresses PSScriptAnalyzer warnings by ensuring variables are used
  before being declared or suppressing specific errors in build scripts to
  prevent unnecessary code clutter.
---

For unused variable assignment warnings, either use the variable or suppress it using SuppressMessageAttribute if necessary. Use named exports for React components and add type hints when appropriate.