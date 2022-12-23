// @ts-nocheck
import { join } from 'path';

import { includeMarkdown } from '@hashicorp/remark-plugins';
import camelCase from 'lodash/camelCase';
import capitalize from 'lodash/capitalize';
import kebabCase from 'lodash/kebabCase';
import rehypeStringify from 'rehype-stringify';
import { remark } from 'remark';
import emoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import remarkShikiTwoslash from 'remark-shiki-twoslash';
import { u } from 'unist-builder';
import { findAfter } from 'unist-util-find-after';
import between from 'unist-util-find-all-between';
import { select } from 'unist-util-select';

import { getTypesFromPackage } from './typedoc';

type Section = {
  text: string;
  url: string;
};

const generateMarkdownForTypeParam = (typeParam: any) => {
  return [
    u('html', `<span class="text-indigo-600">${typeParam.name}</span>`),
    ...(typeParam.implements?.length > 0
      ? [
          u('text', { value: ' extends ' }),
          u('inlineCode', { value: typeParam.implements[0].type }),
        ]
      : []),
  ];
};

const generateMarkDownForTypeParams = (typeParams: any[]) => {
  const args = typeParams.flatMap((typeParam) =>
    generateMarkdownForTypeParam(typeParam)
  );

  if (typeParams.length > 0) {
    return [u('text', { value: '<' }), ...args, u('text', { value: '>' })];
  }

  return [];
};

const generateMarkDownForType = (type, typeArgs) => {
  if (type === 'union') {
    return typeArgs.map((arg) => arg.type).join(' | ');
  }

  return `${type}${
    typeArgs ? `<${typeArgs.map((arg) => arg.type).join(',')}>` : ''
  }`;
};

const generateMarkDownForProperty = (property) => {
  const id = property.id.split('.');

  return [
    u('heading', { depth: 4 }, [
      u('text', { value: id[id.length - 1] }),
      u('text', { value: ': ' }),
      u(
        'inlineCode',
        generateMarkDownForType(property.type, property.typeArgs)
      ),
    ]),
  ];
};

const generateMarkDownForFunctionSignature = (fnName, signature) => {
  return [
    u('text', { value: `${fnName}` }),
    ...generateMarkDownForTypeParams(signature.typeParams || []),
    u('text', { value: '(' }),
    ...signature.params.flatMap((param, i) => {
      return [
        u('text', {
          value: `${param.name}${param.optional ? '?' : ''}: `,
        }),
        u(
          'inlineCode',
          {
            value: generateMarkDownForType(param.type, param.typeArgs),
          },
          []
        ),
        ...(signature.params.length - 1 !== i
          ? [
              u('text', {
                value: ', ',
              }),
            ]
          : []),
      ];
    }),
    u('text', { value: ')' }),
    u('text', { value: ': ' }),
    u('inlineCode', {
      value: signature.returns?.type
        ? generateMarkDownForType(
            signature.returns.type,
            signature.returns.typeArgs
          )
        : 'void',
    }),
  ];
};

const getOptsFromStr = (str: string) => {
  const defaultOpts = {
    showParent: false,
  };

  str = str?.trim() || '';

  if (!str) {
    return defaultOpts;
  }

  const matches = str.match(/(?<={).*(?=})/);

  if (!matches) {
    return defaultOpts;
  }

  const opts = matches[0].split(',').reduce((accum, opt) => {
    return {
      [camelCase(opt)]: true,
    };
  }, {});

  return {
    ...defaultOpts,
    ...opts,
  };
};

const generateTypeBadge = (type: string) => {
  const typeToColor = {
    class: 'bg-indigo-600',
    function: 'bg-violet-600',
  };

  return u('html', {
    value: `<span class="${
      typeToColor[type] ?? ''
    } text-xs text-white px-4 py-2 rounded-3xl">${capitalize(
      capitalize(type)
    )}</span>`,
  });
};

const _generateTypedocMarkdown = (
  opts: any,
  types: any,
  typeName: string,
  examples: any[]
) => {
  const type = types[typeName];
  const example = examples['.'];

  if (type.type === 'class') {
    let description;
    const children = [];

    const properties = {
      ...(type.properties || {}),
      ...(type.instanceProperties || {}),
    };

    Object.keys(properties).forEach((propertyName) => {
      const property = properties[propertyName];

      let listChildren: any[] = [];

      if (property.kind === 'method') {
        listChildren = property.signatures.flatMap((signature) => {
          return [
            u(
              'heading',
              { depth: 4 },
              generateMarkDownForFunctionSignature(propertyName, signature)
            ),
          ];
        });

        if (property.description) {
          listChildren.push(
            u('paragraph', [u('text', { value: property.description })])
          );
        }

        if (examples[propertyName]) {
          listChildren.push(...examples[propertyName]);
        }
      } else if (property.kind === 'property') {
        listChildren.push(...generateMarkDownForProperty(property));

        if (property.description) {
          listChildren.push(
            u('paragraph', [u('text', { value: property.description })])
          );
        }
      }

      if (listChildren.length > 0) {
        children.push(u('listItem', listChildren));
      }
    });

    if (type.description) {
      description = u('paragraph', [u('text', { value: type.description })]);
    }

    return [
      u('heading', { depth: 3 }, [
        u('text', { value: type.id }),
        ...(opts.showParent && type.extends && type.extends.type !== 'Object'
          ? [
              u('html', {
                value: `<span><span class="text-xs text-gray-600 mx-2">extends</span><span class="text-blue-600 text-sm">${type.extends.type}</span></span>`,
              }),
            ]
          : []),
      ]),
      generateTypeBadge('class'),
      ...(description ? [description] : []),
      ...(example || []),
      ...(children.length === 0
        ? []
        : [
            u('list', {
              children,
            }),
          ]),
    ];
  } else if (type.type === 'Function') {
    return [
      ...type.signatures.flatMap((signature) => {
        return [
          u(
            'heading',
            { depth: 4 },
            generateMarkDownForFunctionSignature(type.id, signature)
          ),
          generateTypeBadge('function'),
          ...(type.description
            ? [u('paragraph', [u('text', { value: type.description })])]
            : []),
          ...(examples[type.id] ?? []),
        ];
      }),
    ];
  }

  return [];
};

const generateTypedocMarkdown = (typedocArgs: string, examples: any[]) => {
  const [packagePath, typeName, optsStr] = typedocArgs.split(' ');

  const opts = getOptsFromStr(optsStr);
  const types = getTypesFromPackage(packagePath);

  if (typeName === 'classes') {
    return Object.keys(types)
      .filter((type) => types[type].type === 'class')
      .flatMap((type) => {
        return _generateTypedocMarkdown(opts, types, type, examples);
      });
  }

  if (typeName === 'functions') {
    return Object.keys(types)
      .filter((type) => types[type].type === 'Function')
      .flatMap((type) => {
        return _generateTypedocMarkdown(opts, types, type, examples);
      });
  }

  if (typeName === '*') {
    return Object.keys(types).flatMap((type) =>
      _generateTypedocMarkdown(opts, types, type, examples)
    );
  }

  return _generateTypedocMarkdown(opts, types, typeName, examples);
};

export default async function markdownToHtml(markdown: string) {
  let title: string | null = null;

  const sections: Section[] = [];

  const types = [];

  const result = await remark()
    .use(includeMarkdown, { resolveFrom: join(process.cwd(), '../') })
    .use(() => {
      return (tree) => {
        const firstHeading = select('heading:first-child', tree);

        if (!firstHeading) {
          return;
        }

        const firstHeadingText = select('text', firstHeading);

        if (!firstHeadingText) {
          return;
        }

        title = firstHeadingText.value;

        tree.children.splice(tree.children.indexOf(firstHeading), 1);
      };
    })
    .use(() => {
      return (tree) => {
        const children = tree.children;

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.type === 'heading' && child.depth === 2) {
            const text = child.children[0].value;
            const url = `#${kebabCase(text)}`;

            sections.push({
              text,
              url,
            });

            child.children = [
              {
                type: 'link',
                url,
                children: child.children,
              },
            ];
          }
        }
      };
    })
    .use(() => {
      return (tree) => {
        for (let i = 0; i < tree.children.length; i++) {
          const child = tree.children[i];

          if (child.type !== 'paragraph') {
            continue;
          }

          const childText = select('text', child);

          if (childText.value.startsWith('!start-typedoc')) {
            const startTypeDoc = child;

            const endTypeDoc = findAfter(tree, i, (node) => {
              return (
                node.type === 'paragraph' &&
                select('text', node).value.startsWith('!end-typedoc')
              );
            });
            const endTypeDocIndex = tree.children.indexOf(endTypeDoc);

            const typedocArgs = childText.value.replace('!start-typedoc ', '');

            const examples = {};

            for (let j = i; j < endTypeDocIndex; j++) {
              const nextChild = tree.children[j];

              if (nextChild.type !== 'paragraph') {
                continue;
              }

              const nextChildText = select('text', nextChild);

              if (nextChildText.value.startsWith('!start-example')) {
                const startExample = tree.children[j];

                const endExample = findAfter(tree, j, (node) => {
                  return (
                    node.type === 'paragraph' &&
                    select('text', node).value.startsWith('!end-example')
                  );
                });

                const exampleName = nextChildText.value.startsWith(
                  '!start-example '
                )
                  ? nextChildText.value.replace('!start-example ', '')
                  : '.';

                const exampleContent = between(tree, startExample, endExample);

                examples[exampleName] = exampleContent;
              }
            }

            const generatedNode = generateTypedocMarkdown(
              typedocArgs,
              examples
            );

            tree.children = [
              ...tree.children.slice(0, i),
              // TODO: insert type doc here
              ...generatedNode,
              ...tree.children.slice(endTypeDocIndex + 1),
            ];
          }
        }
      };
    })
    .use(emoji)
    .use(remarkShikiTwoslash, { theme: 'github-dark' })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

    .process(markdown);

  return {
    title,
    result: String(result),
    sections,
    types,
  };
}
