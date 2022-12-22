import Link from 'next/link';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Text } from '@app/components/text';
import { DOCS_SIDEBAR } from '@app/constants/docs-sidebar';
import { styled } from '@app/styles';
import { getAllDocs, getDocBySlug } from '@app/utils/docs';
import markdownToHtml from '@app/utils/markdown';

const DocNav = styled('nav', {
  width: '15rem',
  '> div': {
    display: 'flex',
    flexDirection: 'column',
    px: '$4',
    overflow: 'auto',
    height: 'calc(100vh - 50px)',
    position: 'sticky',
    top: '5rem',
  },
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
        backgroundColor: '$primary1!important',
        color: '$primary!important',
        fontWeight: 400,
      },
    },
  },
});

const DocPostContent = styled('div', {
  flex: 1,
  overflowX: 'hidden',
  '> div': {
    py: '$5',
    px: '$8',
    margin: '0 auto',
    maxWidth: '100%',
    '@media screen and (min-width: 1000px)': {
      maxWidth: '1000px',
    },
  },

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

const Docs = (props: any) => {
  return (
    <Box css={{ display: 'flex', gap: '$3' }}>
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
                      <DocLink active={props.slug === child.href}>
                        {child.title}
                      </DocLink>
                    </Link>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </DocNav>
      <DocPostContent>
        <Box css={{ width: '100%' }}>
          <DocPostContentHeader>
            <h1>{props.doc.title}</h1>
          </DocPostContentHeader>
          <Box
            className="prose prose-md prose-headings:font-medium prose-h1:mt-8 mb-8 prose-code:bg-"
            css={{
              maxWidth: '100%',
              '> h2 > a': {
                textDecoration: 'none',
              },
            }}
            dangerouslySetInnerHTML={{ __html: props.doc.content }}
          ></Box>
        </Box>
      </DocPostContent>
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

  const { title, result, sections, types } = await markdownToHtml(
    post.content || ''
  );

  return {
    props: {
      slug,
      doc: {
        ...post,
        title: slug === 'introduction' ? 'Introduction' : title || '',
        content: result,
        sections,
        types,
      },
    },
  };
}

export async function getStaticPaths() {
  const docs = getAllDocs(['slug']);

  const paths = docs.map((doc) => {
    return {
      params: {
        slug: doc.fields.slug.split('/'),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}

export default Docs;
