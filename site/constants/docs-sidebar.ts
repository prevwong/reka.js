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
      ],
    },
    {
      title: 'Guides',
      children: [
        {
          title: 'Basic setup',
          href: 'guides/setup',
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
          title: '@composite/core',
          href: 'api/core',
        },
        {
          title: '@composite/types',
          href: 'api/types',
        },
        {
          title: '@composite/parser',
          href: 'api/parser',
        },
        {
          title: '@composite/collaboration',
          href: 'api/collaboration',
        },
        {
          title: '@composite/react',
          href: '#',
        },
      ],
    },
  ],
};
