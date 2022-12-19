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
      title: 'Basic Setup',
      href: 'setup',
    },
  ],
  categories: [
    {
      title: 'Core Concepts',
      children: [
        {
          title: 'State',
          href: '#',
        },
        {
          title: 'Frame',
          href: '#',
        },
        {
          title: 'Components',
          href: '#',
        },
        {
          title: 'Extensions',
          href: '#',
        },
      ],
    },
    {
      title: 'Packages',
      children: [
        {
          title: '@composite/core',
          href: '#',
        },
        {
          title: '@composite/parser',
          href: '#',
        },
        {
          title: '@composite/collaboration',
          href: '#',
        },
        {
          title: '@composite/react',
          href: '#',
        },
      ],
    },
  ],
};
