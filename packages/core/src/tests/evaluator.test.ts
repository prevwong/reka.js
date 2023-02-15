import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';

import { Reka } from '../reka';

const createFrame = (program: string) => {
  const reka = Reka.create();

  reka.load(
    t.state({
      program: Parser.parseProgram(program),
      extensions: {},
    })
  );

  return reka.createFrame({
    id: 'main-frame',
    component: {
      name: 'App',
      props: {},
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
});
