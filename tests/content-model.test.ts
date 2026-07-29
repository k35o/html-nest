import {
  CONTENT_CATEGORY_METAS,
  HTML_ELEMENTS,
  HTML_ELEMENT_TAGS,
  canContain,
  canSelfNest,
  describeAllowedContent,
  getChildren,
  getElement,
  getParents,
  relationOf,
  type ContentCategory,
  type HtmlElementInfo,
} from '../src/index.ts';

const TAG_SET = new Set(HTML_ELEMENT_TAGS);
const CATEGORY_SET = new Set<string>(
  CONTENT_CATEGORY_METAS.map((meta) => meta.key),
);

// Keep element lookup out of the test bodies so they stay branch-free.
const el = (tag: string): HtmlElementInfo => {
  const found = getElement(tag);
  if (found === undefined) {
    throw new Error(`Unknown element: ${tag}`);
  }
  return found;
};

const parentTagsOf = (tag: string): string[] =>
  getParents(el(tag)).map((related) => related.element.tag);

const childTagsOf = (tag: string): string[] =>
  getChildren(el(tag)).map((related) => related.element.tag);

// Precompute referenced child/parent tags missing from the dataset.
const collectDanglingRefs = (): string[] => {
  const dangling: string[] = [];
  for (const element of HTML_ELEMENTS) {
    const referenced = [
      ...element.contentModel.elements,
      ...(element.contentModel.conditionalElements ?? []),
      ...element.contexts.elements,
      ...(element.contexts.conditionalElements ?? []),
    ];
    for (const tag of referenced) {
      if (!TAG_SET.has(tag)) {
        dangling.push(`${element.tag} -> ${tag}`);
      }
    }
  }
  return dangling;
};

// Precompute categories used anywhere that are not known keys.
const collectUnknownCategories = (): string[] => {
  const unknown: string[] = [];
  for (const element of HTML_ELEMENTS) {
    const used: readonly ContentCategory[] = [
      ...element.categories,
      ...(element.conditionalCategories ?? []),
      ...element.contentModel.categories,
      ...(element.contentModel.conditionalCategories ?? []),
      ...element.contexts.categories,
    ];
    for (const category of used) {
      if (!CATEGORY_SET.has(category)) {
        unknown.push(`${element.tag}: ${category}`);
      }
    }
  }
  return unknown;
};

// Precompute violations of "P can contain C ⟺ C accepts P as a parent".
const collectSymmetryMismatches = (): string[] => {
  const mismatches: string[] = [];
  for (const parent of HTML_ELEMENTS) {
    const children = new Set(childTagsOf(parent.tag));
    for (const child of HTML_ELEMENTS) {
      if (parent.tag === child.tag) {
        continue;
      }
      const inChildren = children.has(child.tag);
      const inParents = parentTagsOf(child.tag).includes(parent.tag);
      if (inChildren !== inParents) {
        mismatches.push(`${parent.tag} ∋ ${child.tag}`);
      }
    }
  }
  return mismatches;
};

const DANGLING_REFS = collectDanglingRefs();
const UNKNOWN_CATEGORIES = collectUnknownCategories();
const SYMMETRY_MISMATCHES = collectSymmetryMismatches();
const VOID_NON_EMPTY = HTML_ELEMENTS.filter(
  (element) => element.void && element.contentModel.kind !== 'empty',
).map((element) => element.tag);
const ORPHANS = HTML_ELEMENTS.filter(
  (element) => element.tag !== 'html' && getParents(element).length === 0,
).map((element) => element.tag);

describe('HTML element dataset integrity', () => {
  describe('valid cases', () => {
    it('holds all 115 elements without duplicates', () => {
      expect(HTML_ELEMENTS).toHaveLength(115);
      expect(TAG_SET.size).toBe(HTML_ELEMENTS.length);
    });

    it('only references child/parent tags that exist in the dataset', () => {
      expect(DANGLING_REFS).toStrictEqual([]);
    });

    it('only uses known content category keys', () => {
      expect(UNKNOWN_CATEGORIES).toStrictEqual([]);
    });

    it('gives every void element an empty content model', () => {
      expect(VOID_NON_EMPTY).toStrictEqual([]);
    });
  });

  describe('edge cases', () => {
    it('gives every element except html at least one parent', () => {
      expect(ORPHANS).toStrictEqual([]);
    });

    it('gives the root element html no parent', () => {
      expect(parentTagsOf('html')).toStrictEqual([]);
    });

    it('marks exactly the spec-defined void elements as void', () => {
      const voidTags = HTML_ELEMENTS.filter((element) => element.void)
        .map((element) => element.tag)
        .toSorted();
      // The spec's closed list; notably iframe and selectedcontent are NOT
      // void (both require an end tag)
      expect(voidTags).toStrictEqual([
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'link',
        'meta',
        'source',
        'track',
        'wbr',
      ]);
    });
  });
});

describe('canContain / nesting resolution', () => {
  describe('parent-child symmetry', () => {
    it('P can contain C ⟺ C accepts P as a parent', () => {
      expect(SYMMETRY_MISMATCHES).toStrictEqual([]);
    });
  });

  describe('valid cases (typical nesting)', () => {
    it('allows li inside ul, ol, and menu but not inside div or p', () => {
      const parents = parentTagsOf('li');
      expect(parents).toStrictEqual(
        expect.arrayContaining(['ul', 'ol', 'menu']),
      );
      expect(parents).not.toContain('div');
      expect(parents).not.toContain('p');
    });

    it('lets ul contain li but neither p nor div', () => {
      const children = childTagsOf('ul');
      expect(children).toContain('li');
      expect(children).not.toContain('p');
      expect(children).not.toContain('div');
    });

    it('places tr inside table sections and gives it td/th children', () => {
      expect(parentTagsOf('tr')).toStrictEqual(
        expect.arrayContaining(['table', 'thead', 'tbody', 'tfoot']),
      );
      expect(childTagsOf('tr')).toStrictEqual(
        expect.arrayContaining(['td', 'th']),
      );
    });

    it('allows option inside select, datalist, and optgroup', () => {
      expect(parentTagsOf('option')).toStrictEqual(
        expect.arrayContaining(['select', 'datalist', 'optgroup']),
      );
    });

    it('lets p contain phrasing content such as span but not div', () => {
      const children = childTagsOf('p');
      expect(children).toStrictEqual(
        expect.arrayContaining(['span', 'a', 'strong']),
      );
      expect(children).not.toContain('div');
    });

    it('gives body exactly one parent: html', () => {
      expect(parentTagsOf('body')).toStrictEqual(['html']);
    });
  });

  describe('invalid cases (descendant exclusions)', () => {
    it('rejects a button inside a button (no interactive descendants)', () => {
      expect(canContain(el('button'), el('button')).allowed).toBe(false);
    });

    it('rejects interactive content inside the transparent a', () => {
      expect(canContain(el('a'), el('button')).allowed).toBe(false);
      expect(canContain(el('a'), el('a')).allowed).toBe(false);
    });

    it('rejects a form inside a form', () => {
      expect(canContain(el('form'), el('form')).allowed).toBe(false);
    });

    it('rejects headings inside address', () => {
      expect(canContain(el('address'), el('h1')).allowed).toBe(false);
    });

    it('still allows conditionally interactive elements such as img inside a', () => {
      // img is interactive only with a usemap attribute, so it must not be
      // caught by the interactive exclusion
      expect(canContain(el('a'), el('img')).allowed).toBe(true);
    });
  });

  describe('valid cases (customizable select)', () => {
    it('lets select contain its listed children and script-supporting elements', () => {
      expect(canContain(el('select'), el('script')).allowed).toBe(true);
      expect(canContain(el('select'), el('template')).allowed).toBe(true);
      expect(canContain(el('select'), el('hr')).allowed).toBe(true);
      expect(canContain(el('select'), el('noscript')).allowed).toBe(true);
      expect(canContain(el('select'), el('div')).allowed).toBe(true);
    });

    it('lets optgroup contain script-supporting elements besides options', () => {
      expect(canContain(el('optgroup'), el('script')).allowed).toBe(true);
      expect(canContain(el('optgroup'), el('option')).allowed).toBe(true);
    });

    it('lets option conditionally contain div and phrasing content', () => {
      const div = canContain(el('option'), el('div'));
      expect(div.allowed).toBe(true);
      expect(div.conditional).toBe(true);
      expect(canContain(el('option'), el('span')).allowed).toBe(true);
      expect(canContain(el('option'), el('em')).allowed).toBe(true);
      expect(canContain(el('option'), el('p')).allowed).toBe(false);
    });

    it('rejects interactive, datalist, and object content inside option', () => {
      expect(canContain(el('option'), el('button')).allowed).toBe(false);
      expect(canContain(el('option'), el('datalist')).allowed).toBe(false);
      expect(canContain(el('option'), el('object')).allowed).toBe(false);
    });

    it('allows selectedcontent only conditionally inside a button', () => {
      const check = canContain(el('button'), el('selectedcontent'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(true);
    });
  });

  describe('edge cases (special content models)', () => {
    it('gives the void element img no children', () => {
      expect(childTagsOf('img')).toStrictEqual([]);
    });

    it('gives the text-only title no children and head as its parent', () => {
      expect(childTagsOf('title')).toStrictEqual([]);
      expect(parentTagsOf('title')).toStrictEqual(['head']);
    });

    it('lets the transparent a contain flow-like content conditionally', () => {
      const check = canContain(el('a'), el('div'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(true);
    });

    it('allows div to nest inside itself', () => {
      expect(canSelfNest(el('div')).allowed).toBe(true);
    });

    it('allows area in phrasing contexts only conditionally (map ancestor)', () => {
      const inParagraph = canContain(el('p'), el('area'));
      expect(inParagraph.allowed).toBe(true);
      expect(inParagraph.conditional).toBe(true);
      expect(canContain(el('map'), el('area')).conditional).toBe(false);
    });

    it('gives iframe and selectedcontent no children despite not being void', () => {
      expect(childTagsOf('iframe')).toStrictEqual([]);
      expect(childTagsOf('selectedcontent')).toStrictEqual([]);
    });

    it('lets th contain flow content unconditionally, minus its exclusions', () => {
      const check = canContain(el('th'), el('div'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(false);
      expect(canContain(el('th'), el('h1')).allowed).toBe(false);
    });

    it('rejects non-whitelisted interactive content inside canvas fallback', () => {
      expect(canContain(el('canvas'), el('iframe')).allowed).toBe(false);
      expect(canContain(el('canvas'), el('textarea')).allowed).toBe(false);
      // Whitelisted interactive fallback stays allowed
      expect(canContain(el('canvas'), el('button')).allowed).toBe(true);
      expect(canContain(el('canvas'), el('a')).allowed).toBe(true);
    });

    it('allows tr directly inside table only conditionally (no tbody children)', () => {
      const inTable = canContain(el('table'), el('tr'));
      expect(inTable.allowed).toBe(true);
      expect(inTable.conditional).toBe(true);
      expect(canContain(el('tbody'), el('tr')).conditional).toBe(false);
    });

    it('allows main placement only conditionally (hierarchically correct)', () => {
      const inDiv = canContain(el('div'), el('main'));
      expect(inDiv.allowed).toBe(true);
      expect(inDiv.conditional).toBe(true);
      const inArticle = canContain(el('article'), el('main'));
      expect(inArticle.conditional).toBe(true);
    });

    it('allows dt and dd inside a div only conditionally (div child of dl)', () => {
      const check = canContain(el('div'), el('dt'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(true);
      expect(canContain(el('dl'), el('dd')).conditional).toBe(false);
    });

    it('allows source in media elements only conditionally (no src attribute)', () => {
      const check = canContain(el('video'), el('source'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(true);
      expect(canContain(el('audio'), el('track')).conditional).toBe(false);
    });

    it('lets noscript hold flow content conditionally (transparent outside head)', () => {
      // The classic <noscript><iframe/></noscript> tracking snippet
      expect(canContain(el('noscript'), el('iframe')).allowed).toBe(true);
      expect(canContain(el('noscript'), el('img')).allowed).toBe(true);
      expect(canContain(el('noscript'), el('p')).allowed).toBe(true);
      expect(canContain(el('noscript'), el('link')).allowed).toBe(true);
      expect(canContain(el('noscript'), el('noscript')).allowed).toBe(false);
    });
  });

  describe('relationOf', () => {
    it('relates an element to itself as self', () => {
      expect(relationOf(el('div'), el('div')).kind).toBe('self');
    });

    it('relates div and section as both (each can contain the other)', () => {
      expect(relationOf(el('div'), el('section')).kind).toBe('both');
    });

    it('relates select as parent of option and option as child of select', () => {
      expect(relationOf(el('option'), el('select')).kind).toBe('parent');
      expect(relationOf(el('select'), el('option')).kind).toBe('child');
    });

    it('relates li and ul as both because lists can nest', () => {
      expect(relationOf(el('li'), el('ul')).kind).toBe('both');
    });
  });
});

describe('describeAllowedContent / allowed content summary', () => {
  it('lists specific tags for element-based content models', () => {
    expect(describeAllowedContent(el('ul'))).toContain('<li>');
  });

  it('names the category for category-based content models', () => {
    expect(describeAllowedContent(el('div'))).toBe('Flow content');
  });

  it('lists both tags and categories when the element accepts both', () => {
    // details: elements ['summary'] plus categories ['flow']
    const result = describeAllowedContent(el('details'));
    expect(result).toContain('<summary>');
    expect(result).toContain('Flow content');
  });

  it('explains that void elements cannot have children', () => {
    expect(describeAllowedContent(el('img'))).toBe(
      'Void element; it cannot have children',
    );
  });

  it('reports text-only elements as text only', () => {
    expect(describeAllowedContent(el('title'))).toBe('Text only');
  });

  it('lists conditionally accepted content instead of an empty list', () => {
    // colgroup accepts col/template only without a span attribute
    const result = describeAllowedContent(el('colgroup'));
    expect(result).toContain('<col>*');
    expect(result).toContain('<template>*');
    expect(result).not.toBe('—');
  });
});
