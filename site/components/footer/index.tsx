import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import * as React from 'react';

import { Tooltip } from '../tooltip';

const SOCIALS = [
  {
    icon: (
      <GitHubLogoIcon
        className="!w-[1.45rem] !h-[1.45rem]"
        width={12}
        height={12}
      />
    ),
    title: 'Github',
    link: 'http://github.com/prevwong/reka.js',
  },
  {
    icon: <TwitterLogoIcon />,
    title: 'Twitter',
    link: 'https://twitter.com/prevwong',
  },
  {
    icon: <DiscordLogoIcon />,
    title: 'Discord community',
    link: 'https://discord.gg/8sF26BAkYD',
  },
];

export const Footer = () => {
  return (
    <div className="px-5 py-8 border-t border-solid border-t-gray-200 text-sm text-slate-600 flex items-center [&>a]:text-decoration-none">
      <div className="flex flex-col gap-1 m-auto w-auto flex-1 [&_a]:underline [&_a]:text-primary">
        <div>
          Made with{' '}
          <span className="text-sm text-primary inline m-0 -my-1">♥︎</span> by{' '}
          <a
            href="https://twitter.com/prevwong"
            target="_blank"
            rel="noreferrer"
          >
            @prevwong
          </a>
        </div>
        <div>
          Reka is released under the{' '}
          <a
            href="https://github.com/prevwong/reka.js/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT license
          </a>
        </div>
      </div>
      <div className="flex gap-6 [&_svg]:w-6 [&_svg]:h-6">
        {SOCIALS.map((social) => (
          <Tooltip content={social.title} key={social.link}>
            <a
              target="_blank"
              className="text-slate-400 transition-all ease-bezier duration-400 hover:text-slate-800"
              key={social.link}
              rel="noreferrer"
            >
              {social.icon}
            </a>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
