// @ts-nocheck
import kebabCase from 'lodash/kebabCase';
import rehypeStringify from 'rehype-stringify';
import { remark } from 'remark';
import emoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import remarkShikiTwoslash from 'remark-shiki-twoslash';

type Section = {
  text: string;
  url: string;
};

export default async function markdownToHtml(markdown: string) {
  const sections: Section[] = [];

  const result = await remark()
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
    .use(emoji)
    .use(remarkShikiTwoslash, { theme: 'github-dark' })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

    .process(markdown);

  return [String(result), sections];
}
