# @k8o/html-nest

An HTML content-model engine with an [oxlint](https://oxc.rs/docs/guide/usage/linter) plugin on top: structured WHATWG HTML Living Standard data about which elements may nest inside which, and a JSX lint rule that enforces it.

- **Engine** (`@k8o/html-nest`): per-element content categories, content models, and placement contexts straight from the spec's elements index, with query functions (`canContain`, `getParents`, `getChildren`, ...). Covers modern additions such as the customizable `<select>`.
- **Lint rule** (`@k8o/html-nest/oxlint`): `html-nest/valid-html-nesting` reports JSX nesting that violates the spec's content model — including violations browsers silently tolerate (`<div>` in `<ul>`) and descendant restrictions (`<button>` in `<button>`, interactive content in `<a>`).

This package powers [k8o.me/html-nest](https://www.k8o.me/html-nest), an interactive explorer for the same data.

## Install

```sh
pnpm add @k8o/html-nest
```

## Lint JSX with oxlint

`.oxlintrc.json`:

```json
{
  "jsPlugins": ["@k8o/html-nest/oxlint"],
  "rules": {
    "html-nest/valid-html-nesting": "error"
  }
}
```

```tsx
export const Bad = () => (
  <p>
    <div>not allowed</div>
  </p>
);
// error html-nest(valid-html-nesting): Invalid HTML nesting:
//   <div> cannot be a child of <p>. <p> accepts: Phrasing content
```

The rule:

- checks native elements only; components (`<Card>`) and custom elements (`<my-widget>`) are skipped, since what they render is unknowable statically
- resolves the effective parent through fragments and simple expressions — `<p>{cond && <div />}</p>` is reported — but never through function boundaries such as render props
- accepts nesting the spec allows only conditionally (its asterisked cases, e.g. transparent elements like `<a>`), because the condition depends on attributes and context the rule cannot see

> `jsPlugins` requires oxlint's JS plugin support (oxlint >= 1.x with `jsPlugins`, still alpha upstream).

## Use the engine directly

```ts
import { canContain, getElement, getParents } from '@k8o/html-nest';

const p = getElement('p');
const div = getElement('div');
if (p && div) {
  canContain(p, div);
  // { allowed: false, conditional: false }
  getParents(div).map((related) => related.element.tag);
  // ['a', 'address', 'article', ...]
}
```

Key exports:

| Export                                | What it is                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `HTML_ELEMENTS` / `HTML_ELEMENT_TAGS` | The full dataset (115 elements)                                                   |
| `getElement(tag)`                     | Look up one element's info                                                        |
| `canContain(parent, child)`           | Can `parent` have `child` as a direct child (`{ allowed, conditional, reason? }`) |
| `getParents(el)` / `getChildren(el)`  | All allowed parents / children, with conditionality                               |
| `relationOf(selected, candidate)`     | `self` / `both` / `parent` / `child` / `none`                                     |
| `canSelfNest(el)`                     | Whether the element can nest inside itself                                        |
| `describeAllowedContent(el)`          | Short English summary of what the element accepts                                 |
| `CONTENT_CATEGORY_METAS`              | Content category metadata (labels per the spec)                                   |

The data model distinguishes unconditional rules, the spec's asterisked conditional cases (`conditional: true` with a `reason`), and descendant exclusions ("but with no interactive content descendants"), which `canContain` enforces for direct children.

## Develop

```sh
pnpm install
pnpm check     # fmt + lint
pnpm typecheck
pnpm test
pnpm build     # vp pack -> dist/
```

## Release

Versioned and published with [pnpm's built-in release management](https://pnpm.io/versioning),
driven in CI by [k35o/pnpm-release-action](https://github.com/k35o/pnpm-release-action).

```sh
pnpm change   # describe the change (writes .changeset/<name>.md)
```

Merging to `main` lets the release workflow open a release PR and publish to npm.
