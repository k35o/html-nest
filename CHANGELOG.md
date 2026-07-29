# @k8o/html-nest

## 0.2.0

### Minor Changes

- Split display strings out of the dataset and make reason provenance explicit.

  - `HTML_ELEMENTS` is now structure only: `description` and the `note` fields moved to `HTML_ELEMENT_DESCRIPTIONS` in the new `@k8o/html-nest/descriptions` entry point, so bundles that localize or never render them don't ship the English text (~13 kB). Merge them back with the new `applyElementDescriptions(elements, descriptions)`, which also accepts localized records of the same shape. `HtmlElementInfo.description` is optional accordingly.
  - `canContain` results (and `getParents` / `getChildren` entries) now carry `reasonKind: 'note' | 'generic' | 'transparent'` alongside `reason`, so consumers can detect the built-in fallback wordings without string matching.
  - `CONTENT_CATEGORY_METAS` and `CategoryMeta` moved to `@k8o/html-nest/descriptions` (their `description` texts are English display strings); `CONTENT_CATEGORY_LABEL` stays in the main entry.

## 0.1.1

### Patch Changes

- Add the npm version badge to the README and document the oxlint versions the lint rule is verified against.

## 0.1.0

### Minor Changes

- Initial release: a WHATWG HTML content-model engine (element dataset, `canContain`, `getParents` / `getChildren`, and friends) and an oxlint JS plugin exposing the `html-nest/valid-html-nesting` rule for JSX.
