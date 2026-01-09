---
name: zod-schema-authoring
description: Create, refactor, and review Zod schemas from TypeScript types, JSON examples, or API contracts. Use when adding runtime validation to inputs, API payloads, environment variables, or persisted JSON, or when the user asks about Zod schema design, validation patterns, or type inference.
allowed-tools: Read, Grep, Glob
---

# Zod Schema Authoring

## Workflow

1. **Identify the boundary** - Find the real source of truth: request payloads, stored JSON, env vars, tool inputs. TypeScript types are hints, not runtime validators.

2. **Choose strictness** - Use `.strict()` for external/untrusted data. Use `.passthrough()` only when extra keys are expected (document why).

3. **Compose small schemas** - Build reusable primitives (ids, timestamps, urls) and assemble them. Export both schema and inferred type:
   ```ts
   export const FooSchema = z.object({...}).strict();
   export type Foo = z.infer<typeof FooSchema>;
   ```

4. **Model optionality clearly**
   - `.optional()` = field may be missing
   - `.nullable()` = field present but null allowed
   - `.nullish()` = either missing or null

5. **Handle string inputs** - For query params/env vars, use `z.coerce.*` or `z.preprocess(...)`.

6. **Use discriminated unions** - When a tag field exists (e.g. `type`), prefer `z.discriminatedUnion("type", [...])` for better errors and type narrowing.

7. **Parse at boundaries**
   - `schema.safeParse(input)` - for user-facing errors (returns `{ success, data, error }`)
   - `schema.parse(input)` - when invalid input is a bug (throws)

## Patterns

```ts
// Reusable primitives
const IdSchema = z.string().min(1).describe("Opaque identifier");
const ISODateSchema = z.string().datetime();

// Strict object with optional fields
const SessionSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).optional(),
  createdAt: ISODateSchema,
}).strict();

// Discriminated union
const EventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }).strict(),
  z.object({ type: z.literal("scroll"), offset: z.number() }).strict(),
]);

// Coercion for query params
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// Refinement with custom error
const PasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine(s => /[A-Z]/.test(s), "Must contain uppercase letter")
  .refine(s => /[0-9]/.test(s), "Must contain number");
```

## Anti-patterns

```ts
// Avoid z.any() - use z.unknown() with refinement instead
const bad = z.any();
const good = z.unknown().refine((v): v is MyType => validate(v));

// Avoid verbose union for optionality
const bad = z.union([z.string(), z.undefined()]);
const good = z.string().optional();

// Avoid non-strict objects for external data
const bad = z.object({ id: z.string() }); // silently passes extra keys
const good = z.object({ id: z.string() }).strict();
```

## Checklist

- [ ] Using `.strict()` for external data?
- [ ] Exporting both `FooSchema` and `type Foo`?
- [ ] Using `.min()`, `.max()`, `.email()`, `.url()`, `.uuid()` where applicable?
- [ ] Using `.describe()` on fields for documentation?
- [ ] Using discriminated unions when a tag field exists?
- [ ] No `z.any()` without good reason?

## Reference

For detailed Zod API documentation: https://zod.dev/llms.txt

Fetch this URL when you need specifics on transforms, error handling, or lesser-used APIs.
