export { CONTENT_CATEGORY_LABEL, FORM_CATEGORY_LABEL } from './categories';
export {
  canContain,
  canSelfNest,
  describeAllowedContent,
  getChildren,
  getElement,
  getParents,
  relationOf,
  type ContainCheck,
  type ContainReasonKind,
  type RelatedElement,
  type Relation,
} from './content-model';
export {
  HTML_ELEMENTS,
  HTML_ELEMENT_TAGS,
  applyElementDescriptions,
} from './elements';
export type {
  ContentCategory,
  ContentModel,
  ContentModelKind,
  ElementContexts,
  ElementDescription,
  FormCategory,
  HtmlElementInfo,
} from './types';
