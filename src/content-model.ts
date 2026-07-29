import { CONTENT_CATEGORY_LABEL } from './categories';
import { HTML_ELEMENTS } from './elements';
import type { HtmlElementInfo } from './types';

const ELEMENT_BY_TAG: ReadonlyMap<string, HtmlElementInfo> = new Map(
  HTML_ELEMENTS.map((element) => [element.tag, element]),
);

export const getElement = (tag: string): HtmlElementInfo | undefined =>
  ELEMENT_BY_TAG.get(tag);

const intersects = <T>(a: readonly T[], b: readonly T[]): boolean =>
  a.some((value) => b.includes(value));

export type ContainCheck = {
  allowed: boolean;
  // True when allowed only conditionally (the spec's asterisk)
  conditional: boolean;
  // Explanation of the condition when conditional=true
  reason?: string;
};

const NOT_ALLOWED: ContainCheck = { allowed: false, conditional: false };
const GENERIC_REASON = 'Depends on context or attributes (see the spec)';

// Whether `parent` can have `child` as a direct child.
// Nesting is resolved primarily by whether the parent's content model allows
// the child, supplemented by the child's element-specific parents
// (child.contexts.elements).
export const canContain = (
  parent: HtmlElementInfo,
  child: HtmlElementInfo,
): ContainCheck => {
  const model = parent.contentModel;

  // Descendant exclusions ("but with no X descendants") rejected for direct
  // children. Only the child's unconditional categories are matched, so a
  // child that is e.g. interactive only under some attribute stays allowed.
  if (
    (model.excludedElements ?? []).includes(child.tag) ||
    intersects(model.excludedCategories ?? [], child.categories)
  ) {
    return NOT_ALLOWED;
  }

  // transparent: actually follows the parent's content model. Approximate by
  // accepting flow/phrasing, and mark the result conditional to signal the
  // context dependence (required specific children are unconditional).
  if (model.kind === 'transparent') {
    if (model.elements.includes(child.tag)) {
      return { allowed: true, conditional: false };
    }
    const childCategories = new Set([
      ...child.categories,
      ...(child.conditionalCategories ?? []),
    ]);
    const flowLike =
      childCategories.has('flow') || childCategories.has('phrasing');
    return flowLike
      ? {
          allowed: true,
          conditional: true,
          reason:
            parent.contentModel.note ??
            `${parent.tag} is transparent; it follows its parent's content model`,
        }
      : NOT_ALLOWED;
  }

  // empty / none / text / foreign / varies cannot normally contain HTML
  // element children, but allow it when the child explicitly names this
  // parent among its element-specific parents (e.g. link / meta / style
  // inside noscript when scripting is disabled).
  if (model.kind !== 'elements') {
    if (child.contexts.elements.includes(parent.tag)) {
      return { allowed: true, conditional: false };
    }
    if ((child.contexts.conditionalElements ?? []).includes(parent.tag)) {
      return {
        allowed: true,
        conditional: true,
        reason: parent.contentModel.note ?? GENERIC_REASON,
      };
    }
    // Conditional acceptance still applies to non-element content models:
    // e.g. option is text-only normally but accepts option-inner content in
    // customizable select elements.
    if (
      (model.conditionalElements ?? []).includes(child.tag) ||
      intersects(model.conditionalCategories ?? [], [
        ...child.categories,
        ...(child.conditionalCategories ?? []),
      ])
    ) {
      return {
        allowed: true,
        conditional: true,
        reason: model.note ?? GENERIC_REASON,
      };
    }
    return NOT_ALLOWED;
  }

  const childCategories = child.categories;
  const childConditionalCategories = child.conditionalCategories ?? [];

  const elementMatch = model.elements.includes(child.tag);
  const categoryMatch = intersects(model.categories, childCategories);
  const contextMatch = child.contexts.elements.includes(parent.tag);

  const conditionalElementMatch = (model.conditionalElements ?? []).includes(
    child.tag,
  );
  const conditionalCategoryMatch =
    intersects(model.conditionalCategories ?? [], childCategories) ||
    intersects(model.categories, childConditionalCategories) ||
    intersects(model.conditionalCategories ?? [], childConditionalCategories);
  const conditionalContextMatch = (
    child.contexts.conditionalElements ?? []
  ).includes(parent.tag);

  if (elementMatch || categoryMatch || contextMatch) {
    return { allowed: true, conditional: false };
  }
  if (
    conditionalElementMatch ||
    conditionalCategoryMatch ||
    conditionalContextMatch
  ) {
    // Pick the explanation from the side the condition originates on: the
    // child (child conditionally has the category / this parent) or the
    // parent (parent conditionally accepts).
    const childDriven =
      intersects(model.categories, childConditionalCategories) ||
      conditionalContextMatch;
    const reason = childDriven
      ? (child.conditionalNote ??
        child.contexts.note ??
        model.note ??
        GENERIC_REASON)
      : (model.note ?? child.conditionalNote ?? GENERIC_REASON);
    return { allowed: true, conditional: true, reason };
  }
  return NOT_ALLOWED;
};

// Kind of relation a candidate element has to the selected element.
type RelationKind = 'self' | 'both' | 'parent' | 'child' | 'none';

export type Relation = {
  kind: RelationKind;
  // Whether the candidate can be a parent of the selected element
  asParent: ContainCheck;
  // Whether the candidate can be a child of the selected element
  asChild: ContainCheck;
};

// Relation of `candidate` relative to `selected`.
export const relationOf = (
  selected: HtmlElementInfo,
  candidate: HtmlElementInfo,
): Relation => {
  const asParent = canContain(candidate, selected);
  const asChild = canContain(selected, candidate);

  let kind: RelationKind;
  if (selected.tag === candidate.tag) {
    kind = 'self';
  } else if (asParent.allowed && asChild.allowed) {
    kind = 'both';
  } else if (asParent.allowed) {
    kind = 'parent';
  } else if (asChild.allowed) {
    kind = 'child';
  } else {
    kind = 'none';
  }
  return { kind, asParent, asChild };
};

export type RelatedElement = {
  element: HtmlElementInfo;
  conditional: boolean;
  // Explanation of the condition when conditional=true
  reason?: string;
};

const byTag = (a: RelatedElement, b: RelatedElement): number =>
  a.element.tag.localeCompare(b.element.tag);

// Attach `reason` conditionally to stay compatible with
// exactOptionalPropertyTypes.
const toRelated = (
  element: HtmlElementInfo,
  check: ContainCheck,
): RelatedElement =>
  check.reason === undefined
    ? { element, conditional: check.conditional }
    : { element, conditional: check.conditional, reason: check.reason };

// Elements that can contain `selected` (sorted by tag).
export const getParents = (selected: HtmlElementInfo): RelatedElement[] =>
  HTML_ELEMENTS.flatMap((candidate) => {
    if (candidate.tag === selected.tag) {
      return [];
    }
    const check = canContain(candidate, selected);
    return check.allowed ? [toRelated(candidate, check)] : [];
  }).sort(byTag);

// Elements that `selected` can contain (sorted by tag).
export const getChildren = (selected: HtmlElementInfo): RelatedElement[] =>
  HTML_ELEMENTS.flatMap((candidate) => {
    if (candidate.tag === selected.tag) {
      return [];
    }
    const check = canContain(selected, candidate);
    return check.allowed ? [toRelated(candidate, check)] : [];
  }).sort(byTag);

// Whether the element can nest inside itself (div in div, ...).
export const canSelfNest = (selected: HtmlElementInfo): ContainCheck =>
  canContain(selected, selected);

// Short English summary of what the element accepts, for messages shown when
// a nesting is rejected.
export const describeAllowedContent = (element: HtmlElementInfo): string => {
  const cm = element.contentModel;
  if (cm.kind === 'empty') {
    return 'Void element; it cannot have children';
  }
  if (cm.kind === 'none') {
    return 'No content allowed (Nothing)';
  }
  if (cm.kind === 'text') {
    return 'Text only';
  }
  if (cm.kind === 'foreign') {
    return 'SVG / MathML foreign content';
  }
  if (cm.kind === 'varies') {
    return 'Varies by context';
  }
  if (cm.kind === 'transparent') {
    return "Follows the parent's content model (transparent)";
  }
  // Elements accepting both specific elements and categories (details /
  // fieldset / figure, ...) need both listed; either alone would drop e.g.
  // the flow content part.
  const parts = [
    ...cm.elements.map((tag) => `<${tag}>`),
    ...cm.categories.map((category) => CONTENT_CATEGORY_LABEL[category]),
  ];
  return parts.length > 0 ? parts.join(' / ') : '—';
};
