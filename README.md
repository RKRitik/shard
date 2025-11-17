# Shard

A small monorepo where every package stays modular, typed, and actually maintainable.  
Built with **pnpm workspaces**, **TypeScript**, and a clean build/dev flow for each package.

## 🧩 Monorepo Structure
shard/
packages/
api/ → Backend (ts-node-dev)
cli/ → CLI tool (tsup)
types/ → Shared types (TS build only)


Each package is isolated but fully linked through pnpm workspaces, so imports like `@shard/types` just work.

---

## 🛠 Tech Stack

- **pnpm workspaces** → Fast installs + automatic linking  
- **TypeScript** everywhere  
- **ts-node-dev** → Hot reload for the API  
- **tsup** → Bundler for CLI (fast + minimal)  
- **tsc** → Emits shared type declarations in `packages/types`

---

## 🚀 Getting Started

### 1. Install deps
```pnpm install```


### 2. Start all packages in dev mode

```pnpm run dev```


This runs:

- `@shard/api` → `ts-node-dev --respawn`
- `@shard/cli` → `tsup --watch`
- `@shard/types` → `tsc --watch` (only emits `.d.ts` files)

---

## 📦 Packages

### **@shard/types**
Shared TypeScript types for all packages.


## 🧼 Scripts (root)

```pnpm run dev```  → Runs dev for all packages
```pnpm build```     → Builds all packages (if you add this)

## 🔮 Roadmap

 Add more shared utilities
 
 Package versioning with changesets (probably)

 Internal tests + CI

 Polish CLI commands

 API routing setup

 Decide a publish strategy (npm or self-hosted registry)