import { CONTENT_CATEGORY_LABEL } from './categories';
import type { ContentCategory, ElementDescription } from './types';

// English display strings for the dataset, split from the structural data in
// ./elements so they can be left out of bundles that localize or never
// render them. Merge them back with applyElementDescriptions(HTML_ELEMENTS,
// HTML_ELEMENT_DESCRIPTIONS).
export const HTML_ELEMENT_DESCRIPTIONS: Readonly<
  Record<string, ElementDescription>
> = {
  a: {
    description: 'Anchor element representing a hyperlink',
    contentModelNote:
      "Follows the parent's content model. Must not contain interactive content, a elements, or elements with a tabindex attribute among its descendants",
  },
  abbr: {
    description: 'Abbreviation or acronym',
  },
  address: {
    description: 'Contact information',
    contentModelNote:
      'Must not contain heading content, sectioning content, header, footer, or address descendants',
  },
  area: {
    description: 'Region on an image map',
    contextsNote: 'Must be a descendant of a map element',
    conditionalNote: 'Only if there is a map element ancestor',
  },
  article: {
    description: 'Self-contained, independently distributable composition',
  },
  aside: {
    description: 'Content tangentially related to the surrounding content',
  },
  audio: {
    description: 'Embedded sound or audio stream',
    contentModelNote:
      "Follows the parent's content model. Source elements only when there is no src attribute; track elements either way; no media element descendants",
  },
  b: {
    description: 'Text to which attention is being drawn',
  },
  base: {
    description: 'Base URL and default link target for the document',
  },
  bdi: {
    description: 'Text isolated for bidirectional formatting',
  },
  bdo: {
    description: 'Explicit text directionality override',
  },
  blockquote: {
    description: 'Section quoted from another source',
  },
  body: {
    description: 'Main content of the document, directly under the root',
    contextsNote: 'Second child of the html element',
  },
  br: {
    description: 'Line break',
  },
  button: {
    description: 'Clickable button',
    contentModelNote:
      'Phrasing content with no interactive content descendants',
  },
  canvas: {
    description: 'Scriptable resolution-dependent bitmap canvas',
    contentModelNote:
      "Follows the parent's content model (transparent). Interactive content is not allowed in fallback content, except a, button, select, img with usemap, and checkbox/radio/button inputs",
  },
  caption: {
    description: 'Title or caption of a table',
    contentModelNote: 'Flow content with no table element descendants',
    contextsNote: 'First child of a table element',
  },
  cite: {
    description: 'Title of a work',
  },
  code: {
    description: 'Fragment of computer code',
  },
  col: {
    description: 'Table column',
    contextsNote: 'Child of a colgroup element that has no span attribute',
  },
  colgroup: {
    description: 'Group of table columns',
    contentModelNote:
      'When it has no span attribute: col and template elements',
  },
  data: {
    description: 'Content with a machine-readable value',
  },
  datalist: {
    description: 'Predefined options for other controls',
    contentModelNote:
      'Either phrasing content, or option elements mixed with script-supporting elements',
  },
  dd: {
    description: 'Description or value in a description list',
    contextsNote: 'Inside a div, only if the div is a child of a dl element',
  },
  del: {
    description: 'Content removed from the document',
    contentModelNote: "Follows the parent's content model",
  },
  details: {
    description: 'Disclosure widget that can be opened and closed',
  },
  dfn: {
    description: 'Defining instance of a term',
    contentModelNote: 'Phrasing content with no dfn element descendants',
  },
  dialog: {
    description: 'Dialog box or subwindow',
  },
  div: {
    description: 'Generic block-level container',
    contextsNote:
      'Also allowed inside select, optgroup, and option as a wrapper',
  },
  dl: {
    description: 'Description list of name-value groups',
  },
  dt: {
    description: 'Name or term in a description list',
    contentModelNote:
      'Flow content with no header, footer, sectioning content, or heading content descendants',
    contextsNote: 'Inside a div, only if the div is a child of a dl element',
  },
  em: {
    description: 'Stress emphasis',
  },
  embed: {
    description: 'Integration point for an external application or plugin',
  },
  fieldset: {
    description: 'Group of form controls',
  },
  figcaption: {
    description: 'Caption or legend for a figure',
  },
  figure: {
    description: 'Self-contained content with an optional caption',
  },
  footer: {
    description:
      'Footer for its section: authorship, related links, and similar',
    contentModelNote: 'Must not contain header or footer descendants',
  },
  form: {
    description: 'Form with submittable controls',
    contentModelNote: 'Must not contain form element descendants',
  },
  h1: {
    description: 'Heading level 1 (highest)',
  },
  h2: {
    description: 'Heading level 2',
  },
  h3: {
    description: 'Heading level 3',
  },
  h4: {
    description: 'Heading level 4',
  },
  h5: {
    description: 'Heading level 5',
  },
  h6: {
    description: 'Heading level 6 (lowest)',
  },
  head: {
    description: 'Container for document metadata',
  },
  header: {
    description: 'Introductory content or navigation aids for its section',
    contentModelNote: 'Must not contain header or footer descendants',
  },
  hgroup: {
    description: 'Heading grouped with subheadings',
  },
  hr: {
    description: 'Paragraph-level thematic break',
    contextsNote: 'Also allowed inside select as a separator',
  },
  html: {
    description: 'Root element of an HTML document; contains head and body',
    contextsNote: 'Root element',
  },
  i: {
    description: 'Text in an alternate voice or mood (idiomatic text)',
  },
  iframe: {
    description: 'Nested browsing context (inline frame)',
    contentModelNote:
      'Nothing; iframe is not a void element and requires an end tag',
  },
  img: {
    description: 'Embedded image',
  },
  input: {
    description: 'Form input control',
  },
  ins: {
    description: 'Content added to the document',
    contentModelNote: "Follows the parent's content model",
  },
  kbd: {
    description: 'User input, such as keyboard input',
  },
  label: {
    description: 'Caption for a form control',
    contentModelNote:
      'Phrasing content with no label element descendants, and no labelable descendants other than the labeled control',
  },
  legend: {
    description: 'Caption for a fieldset',
  },
  li: {
    description: 'List item',
  },
  link: {
    description: 'Link to an external resource (metadata)',
    conditionalNote:
      'When it has an itemprop attribute, or rel consists only of body-ok keywords (stylesheet, preload, preconnect, ...); it may then appear in the body',
  },
  main: {
    description: 'Dominant content of the document',
    conditionalNote:
      'Only if it is a hierarchically correct main element (ancestors limited to html, body, div, form without an accessible name, and autonomous custom elements)',
  },
  map: {
    description: 'Image map definition with clickable areas',
    contentModelNote:
      "Follows the parent's content model. May contain area element descendants",
  },
  mark: {
    description: 'Text highlighted for reference or notation',
  },
  math: {
    description: 'Root of a MathML mathematical expression',
    contentModelNote: 'MathML foreign content',
  },
  menu: {
    description: 'Toolbar-like list of commands',
  },
  meta: {
    description: 'Document metadata',
    contextsNote: 'Inside noscript, or in phrasing contexts in some cases',
    conditionalNote:
      'When it has an itemprop attribute (microdata); it may then appear in the body',
  },
  meter: {
    description: 'Gauge for a scalar value within a known range',
    contentModelNote: 'Phrasing content with no meter element descendants',
  },
  nav: {
    description: 'Section of navigation links',
  },
  noscript: {
    description: 'Fallback content for when scripting is disabled',
    contentModelNote:
      'In head (scripting disabled): link, style, and meta elements. Outside head (scripting disabled): transparent with no noscript descendants. When scripting is enabled: text',
    contextsNote: 'Inside head, or in phrasing contexts in some cases',
  },
  object: {
    description: 'External resource such as an image or nested document',
    contentModelNote: "Follows the parent's content model",
  },
  ol: {
    description: 'Ordered list',
  },
  optgroup: {
    description: 'Group of options inside a select',
  },
  option: {
    description: 'Option in a select, datalist, or optgroup',
    contentModelNote:
      'Text; or, without a label attribute and outside datalist, div elements and phrasing content with no interactive, datalist, or object descendants',
  },
  output: {
    description: 'Result of a calculation',
  },
  p: {
    description: 'Paragraph',
  },
  picture: {
    description: 'Container offering multiple image sources',
  },
  pre: {
    description: 'Preformatted text',
  },
  progress: {
    description: 'Progress of a task',
    contentModelNote: 'Phrasing content with no progress element descendants',
  },
  q: {
    description: 'Short inline quotation',
  },
  rp: {
    description: 'Fallback parentheses for browsers without ruby support',
  },
  rt: {
    description: 'Ruby text annotation',
  },
  ruby: {
    description: 'Ruby annotation',
    contentModelNote:
      'The full prose model also restricts ruby descendants (at most one directly nested ruby, with no deeper nesting)',
  },
  s: {
    description: 'Content that is no longer accurate (strikethrough)',
  },
  samp: {
    description: 'Sample output from a program',
  },
  script: {
    description: 'Embedded script or data',
    contentModelNote: 'Script such as JavaScript, or data',
  },
  search: {
    description: 'Region for search or filtering controls',
  },
  section: {
    description: 'Generic section with a heading',
  },
  select: {
    description: 'Control for selecting among options',
    contentModelNote:
      'When the select is a drop-down box, a single button may appear first',
  },
  selectedcontent: {
    description: 'Mirror of the selected option content inside a select',
    contentModelNote:
      'Nothing; the browser mirrors the selected option content into it',
    contextsNote:
      'Inside a button element that is the first child of a select element',
    conditionalNote:
      'Only as a descendant of a button element that is a child of a select element',
  },
  slot: {
    description: 'Placeholder for shadow DOM content',
    contentModelNote:
      "Follows the parent's content model. May hold fallback content",
  },
  small: {
    description: 'Side comment such as a disclaimer or fine print',
  },
  source: {
    description: 'Media source candidate for picture, video, or audio',
  },
  span: {
    description: 'Generic inline container with no inherent meaning',
  },
  strong: {
    description: 'Strong importance or urgency',
  },
  style: {
    description: 'Embedded CSS style information',
    contentModelNote: 'Style information such as CSS',
  },
  sub: {
    description: 'Subscript',
  },
  summary: {
    description: 'Summary or caption for a details disclosure',
  },
  sup: {
    description: 'Superscript',
  },
  svg: {
    description: 'Embedded SVG vector graphics',
    contentModelNote: 'SVG foreign content',
  },
  table: {
    description: 'Tabular data',
    contentModelNote:
      'Direct tr children only if the table has no tbody children',
  },
  tbody: {
    description: 'Group of table body rows',
  },
  td: {
    description: 'Table data cell',
  },
  template: {
    description: 'Template for client-side content cloning',
    contentModelNote:
      'Content model is Nothing; its markup is stored in the content DocumentFragment',
  },
  textarea: {
    description: 'Multiline plain-text form control',
  },
  tfoot: {
    description: 'Group of table footer rows',
  },
  th: {
    description: 'Table header cell',
    contentModelNote:
      'Flow content with no heading, sectioning, header, or footer descendants',
  },
  thead: {
    description: 'Group of table header rows',
  },
  time: {
    description: 'Machine-readable date, time, or duration',
  },
  title: {
    description: 'Document title (metadata)',
  },
  tr: {
    description: 'Table row of cells (th / td)',
    contentModelNote: 'Cells (td / th) and script-supporting elements',
    contextsNote:
      'Directly inside table only if the table has no tbody children, after any caption, colgroup, and thead elements',
  },
  track: {
    description: 'Timed text track (captions, subtitles) for media elements',
  },
  u: {
    description: 'Text with a non-textual annotation (unarticulated)',
  },
  ul: {
    description: 'Unordered list',
  },
  var: {
    description: 'Variable in a mathematical expression or program',
  },
  video: {
    description: 'Embedded video',
    contentModelNote:
      "Follows the parent's content model. Source elements only when there is no src attribute; track elements either way; no media element descendants",
  },
  wbr: {
    description: 'Line-break opportunity',
  },
};

// Display metadata for content categories. Labels use the official names
// from the WHATWG HTML Standard.
export type CategoryMeta = {
  key: ContentCategory;
  label: string;
  description: string;
};

const CONTENT_CATEGORY_DESCRIPTION: Record<ContentCategory, string> = {
  metadata:
    'Sets up document metadata and relationships with other resources; mostly placed in head.',
  flow: 'Most elements used in the body of a document; the bulk of what appears directly under body.',
  sectioning: 'Scopes headings and outlines: article, aside, nav, and section.',
  heading: 'Section headings: h1-h6 and hgroup.',
  phrasing:
    'The text of the document and its intra-paragraph markup (inline-level).',
  embedded: 'Imports external resources such as images, video, and audio.',
  interactive:
    'Intended for user interaction: a, button, input, select, and so on.',
  palpable: 'Has non-empty content that users can perceive.',
  'script-supporting':
    'Not rendered; supports processing: script and template.',
};

// Ordered to match the spec's introduction of categories (§3.2.5.2 Kinds of
// content), which CONTENT_CATEGORY_LABEL's key order follows.
export const CONTENT_CATEGORY_METAS: readonly CategoryMeta[] = (
  Object.keys(CONTENT_CATEGORY_LABEL) as ContentCategory[]
).map((key) => ({
  key,
  label: CONTENT_CATEGORY_LABEL[key],
  description: CONTENT_CATEGORY_DESCRIPTION[key],
}));

export type { ElementDescription } from './types';
