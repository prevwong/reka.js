// @ts-nocheck
import rehypeStringify from 'rehype-stringify';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import remarkShikiTwoslash from 'remark-shiki-twoslash';

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkShikiTwoslash, { theme: 'github-dark' })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(result);
}
