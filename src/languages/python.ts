import { SyntaxNode } from "web-tree-sitter";
import { getPojoMatchers } from "./getPojoMatchers";
import {
  delimitedMatcher,
  hasType,
  possiblyWrappedNode,
  simpleSelectionExtractor,
} from "../nodeMatchers";
import { NodeMatcher, ScopeType } from "../Types";
import { TextEditor } from "vscode";
import { getDefinitionNode } from "../treeSitterUtils";

// TODO figure out how to properly use super types
// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
//   | jq '[.[] | select(.type == primary_expression or .type == expression) | .subtypes[].type]'
const EXPRESSION_TYPES = [
  "attribute",
  "await",
  "binary_operator",
  "boolean_operator",
  "call",
  "comparison_operator",
  "concatenated_string",
  "conditional_expression",
  "dictionary",
  "dictionary_comprehension",
  "ellipsis",
  "false",
  "float",
  "generator_expression",
  "identifier",
  "integer",
  "lambda",
  "list",
  "list_comprehension",
  "named_expression",
  "none",
  "not_operator",
  "parenthesized_expression",
  "primary_expression",
  "set",
  "set_comprehension",
  "string",
  "subscript",
  "true",
  "tuple",
  "unary_operator",
];

function isExpression(node: SyntaxNode) {
  return EXPRESSION_TYPES.includes(node.type);
}

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
//   | jq '[.[] | select(.type == _simple_statement or .type == _compound_statement) | .subtypes[].type]'
const STATEMENT_TYPES = [
  "assert_statement",
  "break_statement",
  "class_definition",
  "continue_statement",
  "decorated_definition",
  "delete_statement",
  "exec_statement",
  "expression_statement",
  "for_statement",
  "function_definition",
  "future_import_statement",
  "global_statement",
  "if_statement",
  "import_from_statement",
  "import_statement",
  "nonlocal_statement",
  "pass_statement",
  "print_statement",
  "raise_statement",
  "return_statement",
  "try_statement",
  "while_statement",
  "with_statement",
];

// TODO: Don't hard code this
const LIST_ELEMENT_TYPES = [
  ...EXPRESSION_TYPES,
  "list_splat",
  "parenthesized_list_splat",
  "yield",
];

// TODO: Don't hard code this
const ARGUMENT_TYPES = [
  ...EXPRESSION_TYPES,
  "list_splat",
  "dictionary_splat",
  "parenthesized_expression",
  "keyword_argument",
];

function possiblyDecoratedDefinition(...typeNames: string[]): NodeMatcher {
  return possiblyWrappedNode(
    (node) => node.type === "decorated_definition",
    (node) => typeNames.includes(node.type),
    getDefinitionNode
  );
}

const nodeMatchers: Record<ScopeType, NodeMatcher> = {
  ...getPojoMatchers(
    ["dictionary", "dictionary_comprehension"],
    ["list", "list_comprehension"],
    (node) => LIST_ELEMENT_TYPES.includes(node.type)
  ),
  ifStatement: hasType("if_statement"),
  class: possiblyDecoratedDefinition("class_definition"),
  statement: hasType(...STATEMENT_TYPES),
  arrowFunction: hasType("lambda"),
  functionCall: hasType("call"),
  argumentOrParameter: delimitedMatcher(
    (node) =>
      (node.parent?.type === "argument_list" &&
        ARGUMENT_TYPES.includes(node.type)) ||
      node.type === "parameter",
    (node) => node.type === "," || node.type === "(" || node.type === ")",
    ", "
  ),
  namedFunction: possiblyDecoratedDefinition("function_definition"),
  comment: hasType("comment"),
};

export default nodeMatchers;
