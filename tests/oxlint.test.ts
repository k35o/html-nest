import plugin from '../src/oxlint.ts';

// The rule is exercised directly through its ESLint-compatible surface
// (create + JSXElement visitor) with hand-built minimal AST nodes, so the
// tests stay in-process and independent of the oxlint binary.

type NameNode = { type: string; name?: string };
type Ancestor = {
  type: string;
  openingElement?: { name: NameNode };
  parent?: Ancestor | null;
  operator?: string;
  test?: unknown;
  right?: unknown;
  body?: unknown;
  callee?: { type: string; property?: { type: string; name?: string } };
};

const rule = plugin.rules['valid-html-nesting'];
if (rule === undefined) {
  throw new Error('rule valid-html-nesting is not exported by the plugin');
}
const ruleUnderTest = rule;

const jsx = (
  tag: string,
  parent: Ancestor | null = null,
): {
  type: 'JSXElement';
  openingElement: { name: NameNode };
  parent: Ancestor | null;
} => ({
  type: 'JSXElement',
  openingElement: { name: { type: 'JSXIdentifier', name: tag } },
  parent,
});

const wrapper = (type: string, parent: Ancestor | null = null): Ancestor => ({
  type,
  parent,
});

// Run the rule against a single JSX element node and collect messages.
const lint = (node: ReturnType<typeof jsx>): string[] => {
  const messages: string[] = [];
  const visitor = ruleUnderTest.create({
    report: ({ message }) => {
      messages.push(message);
    },
  });
  visitor.JSXElement(node);
  return messages;
};

describe('html-nest/valid-html-nesting', () => {
  describe('valid cases', () => {
    it('accepts phrasing content inside p', () => {
      expect(lint(jsx('span', jsx('p')))).toStrictEqual([]);
    });

    it('accepts li inside ul', () => {
      expect(lint(jsx('li', jsx('ul')))).toStrictEqual([]);
    });

    it('accepts conditionally allowed nesting such as div inside the transparent a', () => {
      expect(lint(jsx('div', jsx('a')))).toStrictEqual([]);
    });

    it('skips components as parent or child', () => {
      expect(lint(jsx('div', jsx('Card')))).toStrictEqual([]);
      expect(lint(jsx('Card', jsx('p')))).toStrictEqual([]);
    });

    it('skips custom elements and unknown tags', () => {
      expect(lint(jsx('div', jsx('my-widget')))).toStrictEqual([]);
      expect(lint(jsx('my-widget', jsx('p')))).toStrictEqual([]);
    });

    it('does not follow function boundaries such as render props', () => {
      // <p>{render(<div />)}</p>: where the div renders is unknowable
      const fn = wrapper(
        'ArrowFunctionExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      expect(lint(jsx('div', fn))).toStrictEqual([]);
    });

    it('does not report JSX in positions that never render', () => {
      // <p>{<div /> ? a : b}</p>: the test operand is only coerced to a boolean
      const ternary = wrapper(
        'ConditionalExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      const testDiv = jsx('div', ternary);
      ternary.test = testDiv;
      expect(lint(testDiv)).toStrictEqual([]);

      // <p>{<div /> && x}</p>: a JSX object is always truthy, so the left
      // operand of && never renders
      const logical = wrapper(
        'LogicalExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      logical.operator = '&&';
      const leftDiv = jsx('div', logical);
      logical.right = wrapper('Identifier');
      expect(lint(leftDiv)).toStrictEqual([]);
    });
  });

  describe('invalid cases', () => {
    it('reports div inside p with the allowed content in the message', () => {
      expect(lint(jsx('div', jsx('p')))).toStrictEqual([
        'Invalid HTML nesting: <div> cannot be a child of <p>. <p> accepts: Phrasing content',
      ]);
    });

    it('reports a button nested inside a button', () => {
      expect(lint(jsx('button', jsx('button')))).toHaveLength(1);
    });

    it('reports div inside ul, which browsers tolerate but the spec rejects', () => {
      expect(lint(jsx('div', jsx('ul')))).toHaveLength(1);
    });

    it('reports li outside list containers', () => {
      expect(lint(jsx('li', jsx('div')))).toHaveLength(1);
    });
  });

  describe('edge cases (effective parent resolution)', () => {
    it('looks through fragments to find the parent element', () => {
      // <p><><div /></></p>
      const fragment = wrapper('JSXFragment', jsx('p'));
      expect(lint(jsx('div', fragment))).toHaveLength(1);
    });

    it('looks through expression containers and logical expressions', () => {
      // <p>{cond && <div />}</p>
      const logical = wrapper(
        'LogicalExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      logical.operator = '&&';
      const div = jsx('div', logical);
      logical.right = div;
      expect(lint(div)).toHaveLength(1);
    });

    it('looks through array literals rendered as children', () => {
      // <p>{[<div />, <div />]}</p>
      const array = wrapper(
        'ArrayExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      expect(lint(jsx('div', array))).toHaveLength(1);
    });

    it('looks through expression-bodied map callbacks', () => {
      // <p>{items.map((item) => <div />)}</p>
      const call = wrapper(
        'CallExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      call.callee = {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'map' },
      };
      const fn = wrapper('ArrowFunctionExpression', call);
      const div = jsx('div', fn);
      fn.body = div;
      expect(lint(div)).toHaveLength(1);
    });

    it('does not look through callbacks of non-iteration calls', () => {
      // <p>{createPortal(<div />)}</p>-like shapes stay unreported
      const call = wrapper(
        'CallExpression',
        wrapper('JSXExpressionContainer', jsx('p')),
      );
      call.callee = { type: 'Identifier' };
      const fn = wrapper('ArrowFunctionExpression', call);
      const div = jsx('div', fn);
      fn.body = div;
      expect(lint(div)).toStrictEqual([]);
    });

    it('reports nothing for a top-level element with no parent', () => {
      expect(lint(jsx('div'))).toStrictEqual([]);
    });
  });
});
