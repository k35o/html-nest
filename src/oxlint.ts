import {
  canContain,
  describeAllowedContent,
  getElement,
} from './content-model';

// Oxlint JS plugin exposing the content-model engine as a lint rule for JSX.
// Registered via `jsPlugins: ["@k8o/html-nest/oxlint"]`; the rule is
// `html-nest/valid-html-nesting`.
//
// The AST and rule types below are a minimal structural subset of the
// ESLint-compatible API oxlint provides, kept local so the published type
// declarations depend on nothing external.

type JsxElementName = {
  type: string;
  name?: string;
};

type AncestorNode = {
  type: string;
  openingElement?: { name: JsxElementName };
  parent?: AncestorNode | null;
};

type JsxElementNode = AncestorNode & {
  type: 'JSXElement';
  openingElement: { name: JsxElementName };
};

type RuleContext = {
  report: (descriptor: { node: JsxElementNode; message: string }) => void;
};

type Rule = {
  meta: {
    type: 'problem';
    docs: { description: string };
  };
  create: (context: RuleContext) => {
    JSXElement: (node: JsxElementNode) => void;
  };
};

type Plugin = {
  meta: { name: string };
  rules: Record<string, Rule>;
};

const isComponentName = (name: string): boolean => /^[A-Z]/u.test(name);

// Nodes the rule looks through when resolving the effective parent element:
// fragments and simple conditional expressions do not introduce a DOM node,
// so `<p>{cond && <div/>}</p>` still renders the div inside the p. Function
// boundaries (render props etc.) are not followed because where they render
// is unknowable statically.
const TRANSPARENT_NODE_TYPES: ReadonlySet<string> = new Set([
  'JSXFragment',
  'JSXExpressionContainer',
  'LogicalExpression',
  'ConditionalExpression',
]);

const findParentElementName = (node: JsxElementNode): string | null => {
  let current = node.parent;
  while (current !== null && current !== undefined) {
    if (current.type === 'JSXElement') {
      const name = current.openingElement?.name;
      return name?.type === 'JSXIdentifier' && name.name !== undefined
        ? name.name
        : null;
    }
    if (!TRANSPARENT_NODE_TYPES.has(current.type)) {
      return null;
    }
    current = current.parent;
  }
  return null;
};

const validHtmlNesting: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that JSX element nesting is valid per the WHATWG HTML content model',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const { name } = node.openingElement;
        if (
          name.type !== 'JSXIdentifier' ||
          name.name === undefined ||
          isComponentName(name.name)
        ) {
          return;
        }
        const child = getElement(name.name);
        if (child === undefined) {
          // Custom elements and unknown tags are out of scope
          return;
        }
        const parentName = findParentElementName(node);
        if (parentName === null || isComponentName(parentName)) {
          return;
        }
        const parent = getElement(parentName);
        if (parent === undefined) {
          return;
        }
        const check = canContain(parent, child);
        // Conditionally allowed nestings (the spec's asterisk) are accepted;
        // whether the condition holds depends on attributes and context the
        // rule cannot see.
        if (check.allowed) {
          return;
        }
        context.report({
          node,
          message: `Invalid HTML nesting: <${child.tag}> cannot be a child of <${parent.tag}>. <${parent.tag}> accepts: ${describeAllowedContent(parent)}`,
        });
      },
    };
  },
};

const plugin: Plugin = {
  meta: { name: 'html-nest' },
  rules: {
    'valid-html-nesting': validHtmlNesting,
  },
};

export default plugin;
