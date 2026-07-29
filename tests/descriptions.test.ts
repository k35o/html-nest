import {
  CONTENT_CATEGORY_METAS,
  HTML_ELEMENT_DESCRIPTIONS,
} from '../src/descriptions.ts';
import {
  HTML_ELEMENTS,
  HTML_ELEMENT_TAGS,
  applyElementDescriptions,
  type HtmlElementInfo,
} from '../src/index.ts';

// Keep element lookup out of the test bodies so they stay branch-free.
const el = (tag: string): HtmlElementInfo => {
  const found = HTML_ELEMENTS.find((element) => element.tag === tag);
  if (found === undefined) {
    throw new Error(`Unknown element: ${tag}`);
  }
  return found;
};

// Precompute tags violating the display/structure split or its coverage, so
// the tests stay branch-free.
const hasDisplayStrings = (element: HtmlElementInfo): boolean =>
  element.description !== undefined ||
  element.conditionalNote !== undefined ||
  element.contentModel.note !== undefined ||
  element.contexts.note !== undefined;

const STRUCTURE_VIOLATIONS = HTML_ELEMENTS.filter((element) =>
  hasDisplayStrings(element),
).map((element) => element.tag);

const INCOMPLETE_METAS = CONTENT_CATEGORY_METAS.filter(
  (meta) => meta.label === '' || meta.description === '',
).map((meta) => meta.key);

const UNDESCRIBED = applyElementDescriptions(
  HTML_ELEMENTS,
  HTML_ELEMENT_DESCRIPTIONS,
)
  .filter((element) => element.description === undefined)
  .map((element) => element.tag);

describe('display strings / structure separation', () => {
  it('keeps HTML_ELEMENTS structure-only (no display strings)', () => {
    expect(STRUCTURE_VIOLATIONS).toStrictEqual([]);
  });

  it('describes every element exactly once, in dataset order', () => {
    expect(Object.keys(HTML_ELEMENT_DESCRIPTIONS)).toStrictEqual([
      ...HTML_ELEMENT_TAGS,
    ]);
  });

  it('gives every content category a meta with label and description', () => {
    // The spec's introduction order (§3.2.5.2 Kinds of content), pinned
    // literally: CONTENT_CATEGORY_METAS derives its order from
    // CONTENT_CATEGORY_LABEL, so comparing the two would prove nothing.
    expect(CONTENT_CATEGORY_METAS.map((meta) => meta.key)).toStrictEqual([
      'metadata',
      'flow',
      'sectioning',
      'heading',
      'phrasing',
      'embedded',
      'interactive',
      'palpable',
      'script-supporting',
    ]);
    expect(INCOMPLETE_METAS).toStrictEqual([]);
  });
});

describe('applyElementDescriptions', () => {
  describe('valid cases', () => {
    it('gives every element a description with the bundled English set', () => {
      expect(UNDESCRIBED).toStrictEqual([]);
    });

    it('merges all four string fields onto the right places', () => {
      const [merged] = applyElementDescriptions([el('area')], {
        area: {
          description: 'イメージマップ上の領域を表す要素',
          contextsNote: 'map要素の子孫であること',
          conditionalNote: '祖先にmap要素があるときのみ',
        },
      });
      expect(merged?.description).toBe('イメージマップ上の領域を表す要素');
      expect(merged?.contexts.note).toBe('map要素の子孫であること');
      expect(merged?.conditionalNote).toBe('祖先にmap要素があるときのみ');
      expect(merged?.contentModel.note).toBeUndefined();
    });

    it('keeps the structural fields of the source element', () => {
      const [merged] = applyElementDescriptions(
        [el('a')],
        HTML_ELEMENT_DESCRIPTIONS,
      );
      expect(merged?.categories).toStrictEqual(el('a').categories);
      expect(merged?.contentModel.kind).toBe('transparent');
      expect(merged?.contentModel.excludedElements).toStrictEqual(
        el('a').contentModel.excludedElements,
      );
    });
  });

  describe('edge cases', () => {
    it('returns elements missing from the record unchanged', () => {
      const result = applyElementDescriptions([el('div'), el('span')], {
        div: { description: '汎用ブロックコンテナ' },
      });
      expect(result[0]?.description).toBe('汎用ブロックコンテナ');
      expect(result[1]).toBe(el('span'));
    });

    it('does not mutate the input elements', () => {
      applyElementDescriptions(HTML_ELEMENTS, HTML_ELEMENT_DESCRIPTIONS);
      expect(
        HTML_ELEMENTS.every((element) => element.description === undefined),
      ).toBe(true);
    });
  });
});
