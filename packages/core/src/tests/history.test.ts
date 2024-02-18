import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';

import { Reka } from '../reka';

let reka: Reka;

beforeEach(() => {
  reka = Reka.create();
  const program = Parser.parseProgram(`
        component App() {
            val count = 1;
        } => (
            <div prop1="hello">
                <text value={count} />
                <button color="red" onClick={() => { count += 1; }} />
            </div>
        )
        `);
  reka.load(t.state({ program }));
});

const HistoryOperationTests = {
  obj: {
    update: () => {
      const countStateLiteralInit = t.assert(
        reka.program.components[0].state[0].init,
        t.Literal
      );

      reka.change(() => {
        countStateLiteralInit.value = 2;
      });

      return {
        beforeChange: () => {
          expect(countStateLiteralInit.value).toEqual(1);
        },
        afterChange: () => {
          expect(countStateLiteralInit.value).toEqual(2);
        },
      };
    },
    add: () => {
      const rootDivTagTplProps = t.assert(
        reka.program.components[0].template,
        t.TagTemplate
      ).props;

      reka.change(() => {
        rootDivTagTplProps['prop2'] = t.literal({ value: 'Bye' });
      });

      return {
        beforeChange: () => {
          expect(rootDivTagTplProps['prop2']).toBeUndefined();
        },
        afterChange: () => {
          expect(rootDivTagTplProps['prop2']).not.toBeUndefined();
        },
      };
    },
    remove: () => {
      const rootDivTagTplProps = t.assert(
        reka.program.components[0].template,
        t.TagTemplate
      ).props;

      reka.change(() => {
        delete rootDivTagTplProps['prop1'];
      });

      return {
        beforeChange: () => {
          expect(rootDivTagTplProps['prop1']).not.toBeUndefined();
        },
        afterChange: () => {
          expect(rootDivTagTplProps['prop1']).toBeUndefined();
        },
      };
    },
  },
  arrays: {
    add: () => {
      const component = t.assert(reka.program.components[0], t.RekaComponent);
      reka.change(() => {
        component.state.push(
          t.val({
            name: 'count2',
            init: t.literal({ value: 0 }),
          })
        );
      });

      return {
        beforeChange: () => {
          expect(
            component.state.find((state) => state.name === 'count2')
          ).toBeUndefined();
        },
        afterChange: () => {
          expect(
            component.state.find((state) => state.name === 'count2')
          ).not.toBeUndefined();
        },
      };
    },
    splice: () => {
      const rootDivTagTpl = t.assert(
        reka.program.components[0].template,
        t.TagTemplate
      );

      reka.change(() => {
        rootDivTagTpl.children.splice(0, 1); // remove text
        rootDivTagTpl.children.splice(1, 0, t.tagTemplate({ tag: 'h1' })); // insert after button
      });

      expect(t.assert(rootDivTagTpl.children[0], t.TagTemplate).tag).toEqual(
        'button'
      );
      expect(t.assert(rootDivTagTpl.children[1], t.TagTemplate).tag).toEqual(
        'h1'
      );

      return {
        beforeChange: () => {
          expect(rootDivTagTpl.children.length).toEqual(2);
          expect(
            t.assert(rootDivTagTpl.children[0], t.TagTemplate).tag
          ).toEqual('text');
          expect(
            t.assert(rootDivTagTpl.children[1], t.TagTemplate).tag
          ).toEqual('button');
        },
        afterChange: () => {
          expect(
            t.assert(rootDivTagTpl.children[0], t.TagTemplate).tag
          ).toEqual('button');
          expect(
            t.assert(rootDivTagTpl.children[1], t.TagTemplate).tag
          ).toEqual('h1');
        },
      };
    },
  },
};

describe('History', () => {
  for (const type in HistoryOperationTests) {
    describe(`${type}`, () => {
      for (const test in HistoryOperationTests[type]) {
        it(`should be able to undo/redo ${test} op`, () => {
          const fn = HistoryOperationTests[type][test];
          const { beforeChange, afterChange } = fn();
          // Verify mutation has been applied
          afterChange();

          // Verify undo has been applied
          expect(reka.canUndo()).toEqual(true);
          reka.undo();
          beforeChange();

          expect(reka.canUndo()).toEqual(false);
          expect(reka.canRedo()).toEqual(true);

          // Verify redo has been applied
          reka.redo();
          afterChange();

          expect(reka.canRedo()).toEqual(false);
          expect(reka.canUndo()).toEqual(true);
        });
      }
    });
  }

  describe('rollback', () => {
    it('should be able to rollback undo op if an error occurs', () => {
      const divTpl = t.assert(
        reka.program.components[0].template,
        t.TagTemplate
      );

      const textTpl = t.assert(divTpl.children[0], t.TagTemplate);

      const btnTpl = t.assert(divTpl.children[1], t.TagTemplate);
      expect(t.assert(btnTpl.props.color, t.Literal).value).toEqual('red');

      reka.change(() => {
        btnTpl.props.color = t.literal({ value: 'blue' });
      });

      expect(t.assert(btnTpl.props.color, t.Literal).value).toEqual('blue');

      reka.change(() => {
        textTpl.props.value = t.literal({ value: 'Bye' });
      });

      reka.change(
        () => {
          // remove text tag template
          divTpl.children.splice(0, 1);
        },
        {
          history: {
            ignore: true,
          },
        }
      );

      reka.undo();

      expect(t.assert(btnTpl.props.color, t.Literal).value).toEqual('red');
    });
  });

  describe('throttle', () => {
    it('should add changes as a single stack item if changes are made within throttle threshold', async () => {
      const divTplProp1 = t.assert(
        reka.program.components[0].template,
        t.TagTemplate,
        (tpl) => t.assert(tpl.props.prop1, t.Literal)
      );

      reka.change(() => {
        divTplProp1.value = 'hellos';
      });

      reka.change(
        () => {
          divTplProp1.value = 'helloss';
        },
        {
          history: {
            throttle: 100,
          },
        }
      );

      expect(divTplProp1.value).toEqual('helloss');

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 200);
      });

      reka.change(
        () => {
          divTplProp1.value = 'hellosss';
        },
        {
          history: {
            throttle: 100,
          },
        }
      );

      expect(divTplProp1.value).toEqual('hellosss');

      reka.undo();

      expect(divTplProp1.value).toEqual('helloss');

      reka.undo();

      expect(divTplProp1.value).toEqual('hello');
    });
  });
});
