import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { IconButton } from '@app/components/button';
import { HeaderToolbar } from '@app/components/header/HeaderToolbar';
import { SEO } from '@app/components/seo';
import { ToolbarDoc } from '@app/components/toolbar-doc';
import { DOCS_SIDEBAR } from '@app/constants/docs-sidebar';
import { cn } from '@app/utils';
import { getAllDocs, getDocBySlug } from '@app/utils/docs';
import markdownToHtml from '@app/utils/markdown';

type DocLinkProps = React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  active?: boolean;
  children?: React.ReactNode;
};

const DocLink = React.forwardRef<HTMLAnchorElement, DocLinkProps>(
  ({ active, children, ...props }, ref) => {
    return (
      <a
        {...props}
        ref={ref}
        className={cn(
          'px-3 py-3 my-2 cursor-pointer text-slate-600 underline-none block w-full rounded-md text-sm',
          {
            'bg-primary/10 text-primary font-normal': active,
            'hover:bg-primary/10 hover:text-primary font-light': !active,
          }
        )}
      >
        {children}
      </a>
    );
  }
);

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
    <div className="flex gap-3 relative">
      <SEO title={props.doc.title} />
      <HeaderToolbar>
        <ToolbarDoc />
      </HeaderToolbar>
      <motion.nav
        className={cn(
          `group
          w-72 relative flex flex-col
          transition bezier duration-400
          max-sm:z-50
          max-sm:w-86 max-sm:fixed max-sm:-left-full max-sm:top-[50px] max-sm:h-[calc(100vh-50px)]
          max-sm:bg-white/60 max-sm:backdrop-blur-md max-sm:overflow-hidden`,
          {
            'max-sm:left-0': mobileNavActive,
          }
        )}
      >
        <div className="mobile-nav-header flex justify-end mb-4">
          <IconButton
            className="absolute z-50 hidden max-sm:block right-2 top-2"
            size="default"
            onClick={() => {
              setMobileNavActive(false);
            }}
          >
            <Cross1Icon />
          </IconButton>
        </div>
        <div className="doc-nav-content flex flex-col overflow-auto h-[calc(100vh-50px)] sticky top-[calc(50px+30px)] px-4 max-sm:h-full max-sm:relative max-sm:overflow-scroll max-sm:top-10 max-sm:py-4 ">
          {DOCS_SIDEBAR.main.map((link, i) => (
            <Link key={i} href={`/docs/${link.href}`} passHref legacyBehavior>
              <DocLink active={props.slug === link.href}>{link.title}</DocLink>
            </Link>
          ))}
          {DOCS_SIDEBAR.categories.map((category, i) => (
            <div className="pt-5" key={i}>
              <span className="block text-sm py-3 px-3 font-medium text-neutral-800">
                {category.title}
              </span>
              <div>
                {category.children.map((child, i) => {
                  return (
                    <Link key={i} href={child.href} passHref legacyBehavior>
                      <DocLink active={props.slug === child.href}>
                        {child.title}
                      </DocLink>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.nav>
      <div className="flex overflow-x-hidden w-full">
        <div
          className={cn(`
          w-full py-5 px-8 mx-auto flex gap-2.5 items-start max-w-[1000px] max-sm:m-0 max-sm:px-4 max-sm:px-5 max-sm:max-w-full
          `)}
        >
          <IconButton
            className="hidden max-sm:block"
            onClick={() => {
              setMobileNavActive(!mobileNavActive);
            }}
          >
            <HamburgerMenuIcon />
          </IconButton>
          <div className="w-full overflow-scroll">
            <article className={'content'}>
              <header className="pb-6 flex gap-2 items-center">
                <h1 className="text-4xl font-medium">{props.doc.title}</h1>
              </header>
              <div
                className="prose prose-md prose-headings:font-medium prose-h1:mt-8 mb-8 max-w-full [&>h2>a]:no-underline [&_p>img]:object-contain [&_p>img]:m-auto [&_p>img]:border [&_p>img]:border-solid [&_p>img]:border-outline"
                ref={contentDomRef}
                dangerouslySetInnerHTML={{ __html: props.doc.content }}
              ></div>
            </article>
          </div>
        </div>
      </div>
    </div>
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
