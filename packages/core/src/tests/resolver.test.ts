import * as t from '@rekajs/types';

import { Frame } from '../frame';
import { createFrame } from './fixtures';

const createTestFrame = () => {
  return createFrame(
    `
        val global = 0;
        
        component App(prop1) {
            val state1 = "hello";
            val state2 = "bye";
        } => (
            <div global={global} dataState1={state1} dataState2={state2} @each={item in $posts} item={item} /> 
        )
    `,
    {
      state: {
        externals: {
          states: [
            t.externalState({
              name: 'posts',
              init: ['one'],
            }),
          ],
        },
      },
    }
  );
};

export const queryFromFrame = (frame: Frame) => {
  const appComponent = frame.reka.components.program.find(
    (component) => component.name === 'App'
  )!;

  const externalState = t.assert(
    frame.reka.externals.getState('posts'),
    t.ExternalState
  );

  const globalState = t.assert(
    frame.reka.program.globals.find((global) => global.name === 'global'),
    t.Val
  );

  const componentProp = t.assert(appComponent.props[0], t.ComponentProp);

  const state1 = t.assert(
    appComponent.state.find((val) => val.name === 'state1'),
    t.Val
  );
  const state2 = t.assert(
    appComponent.state.find((val) => val.name === 'state2'),
    t.Val
  );

  const divTpl = t.assert(appComponent.template, t.TagTemplate);
  const globalProp = t.assert(divTpl.props['global'], t.Identifier);
  const dataState1Prop = t.assert(divTpl.props['dataState1'], t.Identifier);
  const dataState2Prop = t.assert(divTpl.props['dataState2'], t.Identifier);

  const eachIterator = t.assert(divTpl.each?.iterator, t.Identifier);
  const eachAlias = t.assert(divTpl.each?.alias, t.ElementEachAlias);
  const itemProp = t.assert(divTpl.props['item'], t.Identifier);

  return {
    appComponent,
    componentProp,
    externalState,
    globalState,
    state1,
    state2,
    divTpl,
    globalProp,
    dataState1Prop,
    dataState2Prop,
    eachIterator,
    eachAlias,
    itemProp,
  };
};

describe('Resolver', () => {
  describe('getVariableFromIdentifier', () => {
    let frame: Frame;

    beforeEach(async () => {
      frame = await createTestFrame();
    });

    it('should be able to get identifier from various scopes', () => {
      const {
        externalState,
        globalState,

        state1,
        state2,
        globalProp,
        dataState1Prop,
        dataState2Prop,
        eachIterator,
        eachAlias,
        itemProp,
      } = queryFromFrame(frame);

      expect(frame.reka.getVariableFromIdentifier(globalProp)).toEqual(
        globalState
      );

      expect(frame.reka.getVariableFromIdentifier(dataState1Prop)).toEqual(
        state1
      );

      expect(frame.reka.getVariableFromIdentifier(dataState2Prop)).toEqual(
        state2
      );

      expect(frame.reka.getVariableFromIdentifier(eachIterator)).toEqual(
        externalState
      );

      expect(frame.reka.getVariableFromIdentifier(itemProp)).toEqual(eachAlias);
    });

    it('should return null if variable is removed', () => {
      const { globalState, globalProp } = queryFromFrame(frame);

      expect(frame.reka.getVariableFromIdentifier(globalProp)).toEqual(
        globalState
      );

      frame.reka.change(() => {
        frame.reka.program.globals.splice(
          frame.reka.program.globals.indexOf(globalState),
          1
        );
      });

      expect(frame.reka.getVariableFromIdentifier(globalProp)).toEqual(
        undefined
      );
    });
  });

  describe('getVariablesAtNode', () => {
    let frame: Frame;

    beforeEach(async () => {
      frame = await createTestFrame();
    });

    it('should get all variables at a particular scope', () => {
      const {
        externalState,
        globalState,
        appComponent,
        componentProp,
        state1,
        state2,
      } = queryFromFrame(frame);
      expect(
        frame.reka
          .getVariablesAtNode(frame.reka.program, {
            parent: true,
          })
          .map(({ scope, variable }) => ({
            scope: scope.level,
            variable,
          }))
      ).toEqual([{ scope: 'external', variable: externalState }]);

      expect(
        frame.reka
          .getVariablesAtNode(frame.reka.program, {
            includeExternals: false,
          })
          .map(({ scope, variable }) => ({
            scope: scope.level,
            variable,
          }))
      ).toEqual([
        { scope: 'global', variable: globalState },
        { scope: 'global', variable: appComponent },
      ]);

      expect(
        frame.reka
          .getVariablesAtNode(appComponent, {
            includeExternals: false,
            includeAncestors: false,
          })
          .map(({ scope, variable }) => ({
            scope: scope.level,
            variable,
          }))
      ).toEqual([
        { scope: 'component', variable: componentProp },
        { scope: 'component', variable: state1 },
        { scope: 'component', variable: state2 },
      ]);
    });
  });
});
