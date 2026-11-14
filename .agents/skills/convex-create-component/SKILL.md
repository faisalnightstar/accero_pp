---
name: convex-create-component
description: Architecture and authoring guide for building isolated, reusable Convex components and backend modules. Enforces strict schema boundaries, private tables, clean public API contracts, and integration via app.use(). Use when developing modular full-stack backend components, integrations, or plugins with Convex.
license: Apache-2.0
metadata:
  author: get-convex
  version: "1.0.0"
---

# Convex: Create Component Guide

A comprehensive architectural standard for creating isolated, reusable backend components using Convex's component model.

---

## 1. When to Create a Component

Use a Convex Component when:
- Building an isolated, encapsulated piece of backend functionality with its own private database tables (e.g. rate limiter, aggregate counters, audit logs, background task queue).
- Packaging functionality to be published or shared across multiple projects.

Do **NOT** create a component for:
- Simple helper utilities or one-off business logic that belongs directly inside the host app's `convex/` directory.

---

## 2. Component Directory Architecture

```
my-component/
├── convex/
│   ├── _generated/          # Component's private generated code
│   ├── schema.ts            # Component's private database schema
│   ├── convex.config.ts     # Component definition & exports
│   └── (public & internal functions)
├── src/
│   ├── client/              # App-facing client SDK & hooks
│   └── component/           # Re-exports or wrappers
└── package.json
```

---

## 3. Core Component Implementation Steps

### Step 1: Define `convex.config.ts`
Inside the component's `convex/` folder, define the component:

```ts
import { defineComponent } from "convex/server";

const component = defineComponent("myComponent");
export default component;
```

### Step 2: Define Private Schema (`convex/schema.ts`)
Components own their own isolated schema and tables that cannot be queried directly by the host app except through exposed functions:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});
```

### Step 3: Implement Queries, Mutations & Actions
Export public interface functions that the host application will call:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});
```

---

## 4. Registering in the Host Application

Inside the host app's `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import myComponent from "my-component/convex.config";

const app = defineApp();
app.use(myComponent, { name: "myComponent" });

export default app;
```
