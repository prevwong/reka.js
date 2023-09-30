import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';

import { FrameOpts } from '../frame';
import { RekaOpts } from '../interfaces';
import { Reka } from '../reka';

const createFrame = (
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

describe('evaluator', () => {
  describe('view', () => {
    it('should be able to compute a view', async () => {
      const frame = await createFrame(`
          component App() {
              val counter = 0;
          } => (
              <div>
                  <text value={counter} />
              </div>
          )
    `);

      invariant(frame.view instanceof t.RekaComponentView);
      expect(frame.view.render.length).toEqual(1);
      invariant(frame.view.render[0] instanceof t.TagView);
      expect(frame.view.render[0].tag).toEqual('div');
      invariant(frame.view.render[0].children[0] instanceof t.TagView);
      expect(frame.view.render[0].children[0]).toMatchObject({
        type: 'TagView',
        tag: 'text',
        props: { value: 0 },
      });
    });
    it('should be able to compute multiple views from @each directive', async () => {
      const frame = await createFrame(`
          component App() {
              val items = [1,2,3];
          } => (
            <text @each={(item, i) in items} value={i + ":" + item} />
          )
    `);

      expect(
        t.assert(frame.view, t.RekaComponentView, (view) => {
          return t.assert(view.render[0], t.TagView, (view) => {
            return view.children
              .slice(1)
              .every(
                (c, i) =>
                  c instanceof t.TagView && c.props['value'] === `${i}:${i + 1}`
              );
          });
        })
      ).toEqual(true);
    });
    it('should be able to conditionally render view from @if directive', async () => {
      const frame = await createFrame(`
          component App() {
              val items = [1,2,3];
          } => (
            <div>
              <text value="Hi" @if={true} />
              <text value="Bye" @if={false} />
            </div>
          )
      `);

      expect(
        t.assert(frame.view, t.RekaComponentView, (view) => {
          return t.assert(view.render[0], t.TagView, (view) => {
            return view.children.map((child) =>
              t.assert(child, t.TagView, (c) => c.props['value'])
            );
          });
        })
      ).toEqual(['Hi']);
    });
    it('should be able to render another Reka component', async () => {
      const frame = await createFrame(`
          component App() {
              val color="red";
          } => (
            <Button color={color} />
          )

          component Button(color) => (
            <button value={color} />
          )
      `);

      t.assert(frame.view, t.RekaComponentView, (view) => {
        t.assert(view.render[0], t.RekaComponentView, (view) => {
          t.assert(view.render[0], t.TagView, (view) => {
            expect(view.tag).toEqual('button');
            expect(view.props['value']).toEqual('red');
          });
        });
      });
    });
  });

  describe('variables', () => {
    it('should re-evaluate if component state/props is updated', async () => {
      const frame = await createFrame(`
        component App(color="red") {
          val counter = 0;
        } => (
          <text value={"Hello: " + counter + ", " + color} />
        )
      `);

      const view = t.assert(frame.view, t.RekaComponentView, (view) => {
        return t.assert(view.render[0], t.TagView);
      });

      expect(view.props['value']).toEqual('Hello: 0, red');

      await frame.reka.change(() => {
        frame.reka.program.components[0].state[0].init = t.literal({
          value: 10,
        });
      });

      expect(view.props['value']).toEqual('Hello: 10, red');

      await frame.reka.change(() => {
        frame.reka.program.components[0].props[0].init = t.literal({
          value: 'blue',
        });
      });

      expect(view.props['value']).toEqual('Hello: 10, blue');
    });
    it('should re-evaluate if side-effect causes value in env to change', async () => {
      const frame = await createFrame(`
      component App() {
        val counter = 0;
      } => (
        <button value={counter} onClick={() => { counter += 2; }} />
      )
    `);

      const view = t.assert(frame.view, t.RekaComponentView, (view) => {
        return t.assert(view.render[0], t.TagView);
      });

      expect(view.props['value']).toEqual(0);

      await view.props['onClick']();

      expect(view.props['value']).toEqual(2);
    });
    it('should be able to manipulate member expression', async () => {
      const frame = await createFrame(`
        component App() {
          val table = {
            items: [2,3,4]
          };
        } => (
          <button value={table['items'][1]} onClick={() => {
            table.items[1] = 99;
          }} />
        )
      `);

      const view = t.assert(frame.view, t.RekaComponentView, (view) => {
        return t.assert(view.render[0], t.TagView);
      });

      expect(view.props['value']).toEqual(3);

      await view.props['onClick']();

      expect(view.props['value']).toEqual(99);
    });
  });

  it('should not dispose component evaluation when child template order is changed', async () => {
    const frame = await createFrame(`
      component Button() => (
        <text value={"Initial"} />
      )

      component App() => (
        <div>
          <Button /> 
        </div>
      )
    `);

    const getBtnText = (view: t.View) => {
      return t.assert(view, t.RekaComponentView, (view) => {
        return t.assert(view.render[0], t.TagView, (view) => {
          return view.props.value as string;
        });
      });
    };

    const div = t.assert(frame.view, t.RekaComponentView, (view) =>
      t.assert(view.render[0], t.TagView)
    );

    expect(div.children.length).toEqual(1);

    await frame.reka.change(() => {
      t.assert(div.template, t.TagTemplate).children.splice(
        0,
        0,
        t.componentTemplate({
          component: t.identifier({ name: 'Button' }),
        })
      );
    });

    expect(div.children.length).toEqual(2);

    await frame.reka.change(() => {
      const btnComponent = t.assert(
        div.children[0],
        t.RekaComponentView,
        (view) => view.component
      );

      t.assert(btnComponent.template, t.TagTemplate).props.value = t.literal({
        value: 'New',
      });
    });

    expect(getBtnText(div.children[0])).toEqual('New');
    expect(getBtnText(div.children[1])).toEqual('New');
  });
});
