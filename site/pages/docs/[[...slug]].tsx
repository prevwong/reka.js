import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Box } from '@app/components/box';
import { IconButton } from '@app/components/button';
import { Text } from '@app/components/text';
import { DOCS_SIDEBAR } from '@app/constants/docs-sidebar';
import { styled } from '@app/styles';
import { getAllDocs, getDocBySlug } from '@app/utils/docs';
import markdownToHtml from '@app/utils/markdown';

const DocNav = styled(motion.nav, {
  width: '15rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  '.mobile-nav-header': {
    width: '100%',
    px: '$4',
    mt: '$5',
    display: 'none',
  },
  '.doc-nav-content': {
    display: 'flex',
    flexDirection: 'column',
    px: '$4',
    overflow: 'auto',
    height: 'calc(100vh - 50px)',
    position: 'sticky',
    top: '5rem',
  },

  '@mobile': {
    width: '20rem',
    position: 'fixed',
    left: '-100%',
    top: '50px',
    height: 'calc(100vh - 50px)',
    background: 'rgba(255,255,255,0.5)',
    zIndex: '$4',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
    transition: '0.4s cubic-bezier(0.19, 1, 0.22, 1)',
    '> .mobile-nav-header': {
      display: 'flex',
    },
    '> .doc-nav-content': {
      height: '100%',
      position: 'relative',
      overflow: 'scroll',
      top: 0,
      py: '$4',
    },
  },
  variants: {
    active: {
      true: {
        '@mobile': {
          left: 0,
        },
      },
    },
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
    display: 'flex',
    gap: '$5',
    alignItems: 'flex-start',
    maxWidth: '1000px',
    [`> ${IconButton}`]: {
      display: 'none',
      px: '$3',
      py: '$3',
      svg: {
        width: '15px',
        height: '15px',
      },
    },

    '@mobile': {
      margin: 0,
      px: '$4',
      py: '$5',
      maxWidth: '100%',
      [`> ${IconButton}`]: {
        display: 'block',
      },
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
  'p > img': {
    objectFit: 'contain',
    margin: 'auto',
    border: '1px solid #ddd',
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

const DocPostContentHeader = styled('header', {
  pb: '$6',
  display: 'flex',
  gap: '$4',
  alignItems: 'center',
  '> h1': {
    fontSize: '$5',
    fontWeight: 600,
  },
});

const Docs = (props: any) => {
  const contentDomRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [mobileNavActive, setMobileNavActive] = React.useState(false);

  React.useEffect(() => {
    const { current: contentDom } = contentDomRef;

    if (!contentDom) {
      return;
    }

    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLAnchorElement)) {
        return;
      }

      e.preventDefault();

      const href = e.target.href;

      const url = new URL(href);

      const isExternal = url.host !== window.location.host;

      if (isExternal) {
        window.open(href, '__blank');
        return;
      }

      router.push(href);
    };

    contentDom.addEventListener('click', onClick);

    return () => {
      contentDom.removeEventListener('click', onClick);
    };
  }, [router]);

  return (
    <Box css={{ display: 'flex', gap: '$3', position: 'relative' }}>
      <DocNav active={mobileNavActive}>
        <Box
          className="mobile-nav-header"
          css={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: '$4',
          }}
        >
          <IconButton
            transparent
            onClick={() => {
              setMobileNavActive(false);
            }}
          >
            <Cross1Icon style={{ width: '15px', height: '15px' }} />
          </IconButton>
        </Box>
        <Box className="doc-nav-content">
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
          <IconButton
            onClick={() => {
              setMobileNavActive(!mobileNavActive);
            }}
          >
            <HamburgerMenuIcon />
          </IconButton>
          <Box css={{ width: '100%', overflow: 'scroll' }}>
            <article className={'content'}>
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
                ref={contentDomRef}
                dangerouslySetInnerHTML={{ __html: props.doc.content }}
              ></Box>
            </article>
          </Box>
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
