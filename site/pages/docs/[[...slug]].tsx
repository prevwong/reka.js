import { bundleMDX } from 'mdx-bundler';
import { getMDXComponent } from 'mdx-bundler/client';
import Link from 'next/link';
import * as React from 'react';
import rehypeRaw from 'rehype-raw';
import remarkShikiTwoslash from 'remark-shiki-twoslash';

import { Box } from '@app/components/box';
import { Text } from '@app/components/text';
import { DOCS_SIDEBAR } from '@app/constants/docs-sidebar';
import { styled } from '@app/styles';
import { getAllDocs, getDocBySlug } from '@app/utils/docs';

const DocNav = styled('nav', {
  width: '15rem',
  display: 'flex',
  flexDirection: 'column',
  px: '$4',
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  top: '5rem',
});

const DocLink = styled('a', {
  px: '$3',
  py: '$3',
  my: '$2',
  color: '$slate12',
  fontWeight: 300,
  textDecoration: 'none',
  display: 'block',
  width: '100%',
  borderRadius: '$2',
  fontSize: '$2',
  '&:hover': {
    backgroundColor: '$gray2',
    color: '$primary',
  },
  variants: {
    primary: {
      true: {
        color: '$slate11',
        fontWeight: 400,
      },
    },
    active: {
      true: {
        backgroundColor: '$primary1',
        color: '$primary',
        fontWeight: 400,
      },
    },
  },
});

const DocPostContent = styled('div', {
  px: '$8',
  flex: 1,
  margin: '0 auto',
  maxWidth: '1000px',
  'code:not(pre code)': {
    backgroundColor: '$secondary',
    padding: '5px',
    borderRadius: '$2',
    fontWeight: 500,
    '&::after': {
      content: '',
    },
    '&::before': {
      content: '',
    },
  },
  blockquote: {
    fontStyle: 'normal',
    fontSize: '$2',
    fontWeight: 400,
    border: '1px solid $gray5',
    color: '$gray11',
    '> p': {
      '&::after, &::before': {
        content: '',
      },
    },
  },
});

const DocPostContentHeader = styled('div', {
  pb: '$6',
  '> h1': {
    fontSize: '$5',
    fontWeight: 600,
  },
});

const DocPostSidebar = styled('div', {
  width: '15rem',
});

const Docs = (props: any) => {
  const Component = React.useMemo(
    () => getMDXComponent(props.code),
    [props.code]
  );

  return (
    <Box css={{ py: '$5', display: 'flex', gap: '$3' }}>
      <DocNav>
        <Box>
          {DOCS_SIDEBAR.main.map((link, i) => (
            <Link key={i} href={`/docs/${link.href}`} passHref legacyBehavior>
              <DocLink primary active={props.slug === link.href}>
                {link.title}
              </DocLink>
            </Link>
          ))}
          {DOCS_SIDEBAR.categories.map((category, i) => (
            <Box key={i} css={{ pt: '$5' }}>
              <Text
                size={2}
                css={{ py: '$2', px: '$3', fontWeight: 500, color: '$slate12' }}
              >
                {category.title}
              </Text>
              <Box>
                {category.children.map((child, i) => {
                  return (
                    <Link key={i} href={child.href} passHref legacyBehavior>
                      <DocLink>{child.title}</DocLink>
                    </Link>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </DocNav>
      <DocPostContent>
        <DocPostContentHeader>
          <h1>{props.doc.title}</h1>
        </DocPostContentHeader>
        <Box
          className="prose prose-md prose-headings:font-medium prose-h1:mt-8 mb-8 prose-code:bg-"
          css={{ maxWidth: '100%' }}
        >
          <Component />
        </Box>
      </DocPostContent>
      <DocPostSidebar></DocPostSidebar>
    </Box>
  );
};

type Params = {
  params: {
    slug: string[];
  };
};

export async function getStaticProps({ params }: Params) {
  const slug = params.slug.join('/');

  const post = getDocBySlug(params.slug.join('/'), [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ]);

  const contentArr = post.content.split('\n');

  if (contentArr[0] === '# Composite' && params.slug[0] === 'introduction') {
    contentArr.shift();
  }

  let title = post.title;

  if (params.slug[0] === 'introduction') {
    title = 'Introduction';
  }

  const result = await bundleMDX({
    source: contentArr.join('\n'),
    mdxOptions: (options) => {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        [remarkShikiTwoslash, { theme: 'github-dark' }],
      ];

      options.rehypePlugins = [...(options.rehypePlugins ?? []), [rehypeRaw]];

      return options;
    },
  });

  const { code, frontmatter } = result;

  return {
    props: {
      slug,
      code,
      frontmatter,
      doc: {
        ...post,
        title,
      },
    },
  };
}

export async function getStaticPaths() {
  const docs = getAllDocs(['slug']);

  const paths = docs.map((doc) => {
    return {
      params: {
        slug: [doc.slug],
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}

export default Docs;
