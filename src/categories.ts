import type { ContentCategory, FormCategory } from './types';

// Display metadata for content categories. Labels use the official names
// from the WHATWG HTML Standard.
export type CategoryMeta = {
  key: ContentCategory;
  label: string;
  description: string;
};

// Ordered to match the spec's introduction of categories
// (§3.2.5.2 Kinds of content).
export const CONTENT_CATEGORY_METAS: readonly CategoryMeta[] = [
  {
    key: 'metadata',
    label: 'Metadata content',
    description:
      'Sets up document metadata and relationships with other resources; mostly placed in head.',
  },
  {
    key: 'flow',
    label: 'Flow content',
    description:
      'Most elements used in the body of a document; the bulk of what appears directly under body.',
  },
  {
    key: 'sectioning',
    label: 'Sectioning content',
    description:
      'Scopes headings and outlines: article, aside, nav, and section.',
  },
  {
    key: 'heading',
    label: 'Heading content',
    description: 'Section headings: h1-h6 and hgroup.',
  },
  {
    key: 'phrasing',
    label: 'Phrasing content',
    description:
      'The text of the document and its intra-paragraph markup (inline-level).',
  },
  {
    key: 'embedded',
    label: 'Embedded content',
    description: 'Imports external resources such as images, video, and audio.',
  },
  {
    key: 'interactive',
    label: 'Interactive content',
    description:
      'Intended for user interaction: a, button, input, select, and so on.',
  },
  {
    key: 'palpable',
    label: 'Palpable content',
    description: 'Has non-empty content that users can perceive.',
  },
  {
    key: 'script-supporting',
    label: 'Script-supporting elements',
    description: 'Not rendered; supports processing: script and template.',
  },
  {
    key: 'select-inner',
    label: 'select element inner content',
    description: 'Elements allowed inside a customizable select.',
  },
  {
    key: 'optgroup-inner',
    label: 'optgroup element inner content',
    description: 'Elements allowed inside an optgroup.',
  },
  {
    key: 'option-inner',
    label: 'option element inner content',
    description: 'Elements allowed inside an option.',
  },
];

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> =
  Object.fromEntries(
    CONTENT_CATEGORY_METAS.map((meta) => [meta.key, meta.label]),
  ) as Record<ContentCategory, string>;

// Form-related side categories, using the spec's own terms.
export const FORM_CATEGORY_LABEL: Record<FormCategory, string> = {
  listed: 'listed',
  labelable: 'labelable',
  submittable: 'submittable',
  resettable: 'resettable',
  'form-associated': 'form-associated',
};
