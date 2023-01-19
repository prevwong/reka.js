import { styleTags, tags as t } from '@codemirror/highlight';
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
} from '@codemirror/language';

import { parser } from './parser';

export const rekaLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({}),
      foldNodeProp.add({}),
      styleTags({
        'component val': t.keyword,
        String: t.string,
        Number: t.number,
        'ComponentDeclaration/VariableName': t.function(
          t.definition(t.variableName)
        ),
        VariableName: t.variableName,
        'VariableDeclaration/VariableName': t.definition(t.variableName),
        '(': t.paren,
        ')': t.paren,
        '{': t.brace,
        '}': t.brace,
        '=>': t.keyword,
        ElementIdentifier: t.tagName,
        'ElementStartTag ElementStartCloseTag ElementSelfCloseEndTag ElementEndTag':
          t.angleBracket,
        'ElementAttribute/VariableName': t.attributeName,
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: '$',
  },
});

export function reka() {
  return new LanguageSupport(rekaLanguage, []);
}
