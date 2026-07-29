// Structured representation of each HTML element's content categories,
// content model, and placement contexts, as defined by the WHATWG HTML
// Living Standard. The elements index of the spec is the source of truth.

// Content categories used to resolve nesting (category containment is
// pre-expanded into the `categories` set; e.g. every phrasing element also
// belongs to flow, so both appear in `categories`).
export type ContentCategory =
  | 'metadata'
  | 'flow'
  | 'sectioning'
  | 'heading'
  | 'phrasing'
  | 'embedded'
  | 'interactive'
  | 'palpable'
  | 'script-supporting';

// Form-related side categories. Not used for nesting resolution.
export type FormCategory =
  | 'listed'
  | 'labelable'
  | 'submittable'
  | 'resettable'
  | 'form-associated';

// Kind of content model.
// - elements: accepts specific elements and/or categories as children
// - transparent: follows the parent's content model (a, ins, del, object, map, canvas, video, audio, slot)
// - empty: void element; cannot have children
// - none: cannot have children but is not void (template; its markup goes into the content DocumentFragment)
// - text: text only
// - foreign: SVG / MathML foreign content
// - varies: depends on context (noscript)
export type ContentModelKind =
  | 'elements'
  | 'transparent'
  | 'empty'
  | 'none'
  | 'text'
  | 'foreign'
  | 'varies';

// What an element accepts as children (its content model).
export type ContentModel = {
  kind: ContentModelKind;
  // Content categories accepted as children
  categories: readonly ContentCategory[];
  // Specific elements accepted as children (including required specific
  // children of transparent elements such as source / track / area)
  elements: readonly string[];
  // Categories and elements accepted only conditionally (the spec's asterisk)
  conditionalCategories?: readonly ContentCategory[];
  conditionalElements?: readonly string[];
  // Categories and elements that must not appear among descendants (the
  // spec's "but with no X descendants" restrictions). Matched against a
  // child's unconditional categories only, so conditionally-categorized
  // children (e.g. img, interactive only with usemap) stay allowed.
  excludedCategories?: readonly ContentCategory[];
  excludedElements?: readonly string[];
  // Supplementary note for special content models
  note?: string;
};

// Where an element may be placed (its contexts; the "Parents" column of the
// spec). The primary parent-child relation is derived symmetrically from the
// content model; element-specific parents (dd → dl/div, li → ol/ul, ...) are
// supplemented via `elements`.
export type ElementContexts = {
  categories: readonly ContentCategory[];
  elements: readonly string[];
  conditionalElements?: readonly string[];
  // Root elements such as html that have no parent
  special?: 'root';
  note?: string;
};

// Complete information about a single HTML element.
export type HtmlElementInfo = {
  tag: string;
  // Concise description of the element's role
  description: string;
  // Content categories the element belongs to
  categories: readonly ContentCategory[];
  // Categories the element belongs to only conditionally (the spec's asterisk)
  conditionalCategories?: readonly ContentCategory[];
  // Explanation of the condition under which the element participates in a
  // conditional relation (e.g. link: "when it has an itemprop attribute")
  conditionalNote?: string;
  // Form-related side categories
  formCategories?: readonly FormCategory[];
  // What the element accepts as children
  contentModel: ContentModel;
  // Where the element may be placed (placement contexts)
  contexts: ElementContexts;
  // Whether the element is void (contentModel.kind === 'empty')
  void: boolean;
};
