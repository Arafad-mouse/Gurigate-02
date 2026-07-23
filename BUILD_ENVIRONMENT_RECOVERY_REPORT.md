# Build Environment Recovery Report

Date: 2026-06-04

Agent: Agent 3 - Senior DevOps Engineer

Scope: Toolchain/environment recovery only. No application logic was modified.

## Executive Summary

The reported failure:

```txt
Cannot find module: node_modules/typescript/bin/tsc
```

was reproduced inside the restricted Codex sandbox, but not outside it.

TypeScript is installed correctly, pnpm's lockfile includes TypeScript, and the TypeScript executable works when run with normal filesystem access. The failure is caused by sandbox access denial against pnpm-generated dependency files under `node_modules`, not by a missing TypeScript dependency, pnpm workspace misconfiguration, or an application-level build script issue.

After running the required verification outside the sandbox, the toolchain is operational. The build now reaches TypeScript compilation and fails on application/schema type errors, which are outside this Agent 3 scope.

## Inspection Results

### package.json

Findings:

- `typescript` is present in `devDependencies`.
- Build script is present:

```txt
"build": "tsc -b && vite build"
```

- No `typecheck` script is defined.
- No `packageManager` field is defined.

Conclusion: TypeScript is declared correctly. The missing `typecheck` script is a project-script gap, not a broken dependency.

### pnpm-lock.yaml

Findings:

- Lockfile version: `9.0`
- Root importer exists.
- `typescript@5.9.3` is present in the lockfile.
- Dependent packages resolve against `typescript@5.9.3`.

Conclusion: TypeScript is locked correctly.

### pnpm Workspace Configuration

Findings:

- No `pnpm-workspace.yaml` exists at the repo root.

Conclusion: This repo is currently configured as a single root package for pnpm purposes. There is no workspace dependency resolution issue found.

### node_modules / TypeScript Installation

Findings:

- `node_modules/typescript` exists.
- `node_modules/.pnpm/typescript@5.9.3/node_modules/typescript` exists.
- `node_modules/typescript/bin/tsc` exists.
- `node_modules/.bin/tsc.CMD` points to `..\typescript\bin\tsc`.

Sandboxed reads failed with:

```txt
Access is denied.
```

Unsandboxed read succeeded:

```txt
#!/usr/bin/env node
require('../lib/tsc.js')
```

Unsandboxed TypeScript executable check succeeded:

```txt
node node_modules\typescript\bin\tsc --version
Version 5.9.3
```

Conclusion: TypeScript is installed. The observed failure is caused by restricted sandbox access to dependency files, not by a broken pnpm symlink or missing TypeScript package.

## Root Cause Determination

| Possible Cause | Result | Evidence |
| --- | --- | --- |
| TypeScript dependency missing | No | Present in `package.json`, `pnpm-lock.yaml`, and `node_modules`. |
| pnpm symlink/link broken | No | TypeScript package and `.bin` shim exist; executable works outside sandbox. |
| Windows reparse point broken | Not supported by evidence | Files are readable and executable outside sandbox. |
| Workspace dependency resolution incorrect | No | No workspace config exists; root importer resolves TypeScript. |
| Sandbox dependency access restriction | Yes | Sandboxed reads return `Access is denied`; unsandboxed reads and execution succeed. |

## Recovery Actions

Ran:

```txt
npx.cmd --yes pnpm install
```

Result:

```txt
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 2.1s using pnpm v10.31.0
```

Notes:

- pnpm emitted an ignored-build-scripts warning for `esbuild@0.27.3` and `msw@2.12.10`.
- No package files were changed.
- No application files were changed.

## Verification Results

### pnpm install

Command:

```txt
npx.cmd --yes pnpm install
```

Result: PASS

Summary:

```txt
Lockfile is up to date
Already up to date
Done using pnpm v10.31.0
```

### pnpm build

Command:

```txt
npx.cmd --yes pnpm run build
```

Result: TOOLCHAIN PASS / APPLICATION TYPECHECK FAIL

The build no longer fails because of missing `node_modules/typescript/bin/tsc`. It reaches `tsc -b` and fails on TypeScript errors in application files.

Primary error categories:

- Type-only imports required under `verbatimModuleSyntax`.
- Property repository/domain types reference tables or enum values not present in generated Supabase types.
- Property mapper fields do not match generated database row shapes.
- `src/pages/GuriGateLandingPage.tsx` has unresolved/current local type errors.

Representative affected files:

```txt
frontend/src/domain/property/Property.ts
frontend/src/domain/property/PropertyMapper.ts
frontend/src/domain/property/PropertyServiceContract.ts
frontend/src/repositories/property/availabilityRepository.ts
frontend/src/repositories/property/propertyRepository.ts
frontend/src/services/propertyService.ts
src/pages/GuriGateLandingPage.tsx
```

### pnpm typecheck

Result: NOT AVAILABLE

Reason:

```txt
package.json does not define a "typecheck" script.
```

Closest equivalent run:

```txt
npx.cmd --yes pnpm exec tsc -b
```

Result: TOOLCHAIN PASS / APPLICATION TYPECHECK FAIL

The same TypeScript application/schema errors are reported.

## Final Status

```txt
TypeScript dependency ............. PRESENT
pnpm lockfile ..................... VALID
pnpm workspace config ............. NOT USED
node_modules TypeScript package ... PRESENT
TypeScript executable ............. WORKS OUTSIDE SANDBOX
Original missing tsc error ........ RESOLVED AS ENVIRONMENT/SANDBOX ACCESS ISSUE
pnpm install ...................... PASS
pnpm build ........................ TOOLCHAIN PASS, APP TYPE ERRORS REMAIN
pnpm typecheck .................... SCRIPT MISSING; tsc -b USED INSTEAD
```

## Recommendation

For future Codex build verification on this repository, run pnpm/TypeScript verification with normal filesystem access when dependency files under `node_modules` are sandbox-denied. The toolchain itself is usable.

The remaining build failures should be assigned to application/schema reconciliation, not DevOps/toolchain recovery.
