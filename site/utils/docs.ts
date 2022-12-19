import fs from 'fs';
import { join } from 'path';

import matter from 'gray-matter';

import { DOCS_SIDEBAR } from '@app/constants/docs-sidebar';

const postsDirectory = join(process.cwd(), '../docs');

export function getDocSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getDocBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  type Items = {
    [key: string]: string;
  };

  const items: Items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
    }
    if (field === 'content') {
      items[field] = content;
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllDocs(fields: string[] = []) {
  const slugs = [
    ...DOCS_SIDEBAR.main.map((link) => link.href),
    ...DOCS_SIDEBAR.categories.flatMap((category) =>
      category.children.map((child) => child.href)
    ),
  ].filter((link) => link != '#');

  const docs = slugs.map((slug) => getDocBySlug(slug, fields));

  return docs;
}
