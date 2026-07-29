import type { ContentCategory, FormCategory } from './types';

// Labels use the official names from the WHATWG HTML Standard. Key order
// matches the spec's introduction of categories (§3.2.5.2 Kinds of content)
// and is relied on by CONTENT_CATEGORY_METAS in the descriptions entry.
export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  metadata: 'Metadata content',
  flow: 'Flow content',
  sectioning: 'Sectioning content',
  heading: 'Heading content',
  phrasing: 'Phrasing content',
  embedded: 'Embedded content',
  interactive: 'Interactive content',
  palpable: 'Palpable content',
  'script-supporting': 'Script-supporting elements',
};

// Form-related side categories, using the spec's own terms.
export const FORM_CATEGORY_LABEL: Record<FormCategory, string> = {
  listed: 'listed',
  labelable: 'labelable',
  submittable: 'submittable',
  resettable: 'resettable',
  'form-associated': 'form-associated',
};
