type DocLink = {
  title: string;
  href: string;
};

type DocCategory = {
  title: string;
  children: DocLink[];
};

type DocSidebar = {
  main: DocLink[];
  categories: DocCategory[];
};

export const DOCS_SIDEBAR: DocSidebar = {
  main: [
    {
      title: 'Introduction',
      href: 'introduction',
    },
    {
      title: 'Motivation',
      href: 'motivation',
    },
  ],
  categories: [
    {
      title: 'Core Concepts',
      children: [
        {
          title: 'State',
          href: 'concepts/state',
        },
        {
          title: 'Components',
          href: 'concepts/components',
        },
        {
          title: 'Frame',
          href: 'concepts/frame',
        },
        {
          title: 'Externals',
          href: 'concepts/externals',
        },
      ],
    },
    {
      title: 'Guides',
      children: [
        {
          title: 'Getting started',
          href: 'guides/getting-started',
        },
        {
          title: 'Integration with React',
          href: 'guides/react',
        },
        {
          title: 'Realtime Collaboration',
          href: 'guides/realtime',
        },
        {
          title: 'Extensions',
          href: 'guides/extensions',
        },
      ],
    },
    {
      title: 'Packages',
      children: [
        {
          title: '@rekajs/core',
          href: 'api/core',
        },
        {
          title: '@rekajs/types',
          href: 'api/types',
        },
        {
          title: '@rekajs/parser',
          href: 'api/parser',
        },
        {
          title: '@rekajs/collaboration',
          href: 'api/collaboration',
        },
        {
          title: '@rekajs/react',
          href: 'api/react',
        },
      ],
    },
  ],
};
