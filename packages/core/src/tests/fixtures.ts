import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';

import { FrameOpts } from '../frame';
import { RekaOpts } from '../interfaces';
import { Reka } from '../reka';

export const createFrame = (
  program: string,
  opts?: Partial<{ state: RekaOpts; frame: FrameOpts }>
) => {
  const reka = Reka.create(opts?.state);

  reka.load(
    t.state({
      program: Parser.parseProgram(program),
      extensions: {},
    })
  );

  return reka.createFrame({
    id: 'main-frame',
    ...(opts?.frame ?? {}),
    component: {
      name: 'App',
      props: {},
      ...(opts?.frame?.component ?? {}),
    },
  });
};
