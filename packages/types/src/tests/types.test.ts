import * as t from '../';

describe('Reka Types', () => {
  describe('creating a type', () => {
    const type = t.tagTemplate({
      tag: 'div',
      props: {},
      children: [],
    });

    it('should be able to create correct type', () => {
      expect(type instanceof t.TagTemplate).toEqual(true);
      expect(type instanceof t.Template).toEqual(true);
    });

    it('should contain default values', () => {
      expect(type.if).toEqual(null);
      expect(type.each).toEqual(null);
    });
  });

  describe('creating a type with invalid values', () => {
    it('should throw', () => {
      expect(() => {
        // @ts-ignore
        return t.tagTemplate();
      }).toThrow();
    });
  });

  describe('match', () => {
    it('should match exact type instance if specified', () => {
      const type = t.tagTemplate({
        tag: 'p',
        props: {},
        children: [],
      });

      const invalidFn = vi.fn();
      const fn = vi.fn();

      t.match(type, {
        Literal: (node) => invalidFn(node),
        Template: (node) => invalidFn(node),
        TagTemplate: (node) => fn(node),
      });

      expect(fn).toHaveBeenCalledTimes(1);
      expect(invalidFn).toHaveBeenCalledTimes(0);
    });

    it('should match parent type instance if exact type is not specified', () => {
      const type = t.tagTemplate({
        tag: 'p',
        props: {},
        children: [],
      });

      const fn = vi.fn();

      t.match(type, {
        Template: (node) => fn(node),
      });

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('merge', () => {
    it('should merge changes from target type to source type', () => {
      const source = t.tagTemplate({
        tag: 'div',
        props: { color: t.literal({ value: 'red' }) },
        children: [],
      });

      const target = t.tagTemplate({
        tag: 'p',
        props: {
          color: t.literal({ value: 'yellow' }),
          bg: t.literal({ value: 'green' }),
        },
        children: [t.tagTemplate({ tag: 'span', props: {}, children: [] })],
      });

      t.merge(source, target);

      expect(source.tag).toEqual('p');
      expect(source.props['color']['value']).toEqual(
        target.props['color']['value']
      );
      expect(source.props['bg']).toEqual(target.props['bg']);
      expect(
        source.children.length === 1 &&
          source.children[0] === target.children[0]
      ).toEqual(true);
    });
  });

  describe('collect', () => {
    it('should collect all nested type instances', () => {
      const colorProp = t.literal({
        value: 'red',
      });

      const bgProp = t.literal({ value: 'green' });

      const childTpl = t.tagTemplate({
        tag: 'span',
        props: {
          bg: bgProp,
        },
        children: [],
      });

      const sourceTpl = t.tagTemplate({
        tag: 'p',
        props: {
          color: colorProp,
        },
        children: [childTpl],
      });

      const collected = t.collect(sourceTpl);

      expect(
        collected.every((c) =>
          [colorProp, bgProp, childTpl, sourceTpl].includes(c as any)
        )
      ).toEqual(true);
    });
  });

  describe('flatten', () => {
    it('should flatten type', () => {
      const literal = t.literal({
        value: 0,
      });

      const tpl = t.tagTemplate({
        tag: 'p',
        props: {
          counter: literal,
        },
        children: [],
      });

      expect(t.flatten(tpl)).toEqual({
        root: {
          $$typeId: tpl.id,
        },
        types: {
          [tpl.id]: {
            ...tpl,
            tag: 'p',
            props: {
              counter: {
                $$typeId: literal.id,
              },
            },
          },
          [literal.id]: {
            ...literal,
          },
        },
      });
    });
  });

  describe('unflatten', () => {
    it('should be able to unflatten a type', () => {
      const flattened: t.FlattenedType = {
        root: { $$typeId: 'root' },
        types: {
          root: {
            type: 'BinaryExpression',
            left: { $$typeId: 'leftId' },
            operator: '+',
            right: { $$typeId: 'rightId' },
          },
          leftId: {
            type: 'Literal',
            value: 1,
          },
          rightId: {
            type: 'Literal',
            value: 2,
          },
        },
      };

      const unflattened = t.unflatten(flattened) as t.BinaryExpression;

      expect(unflattened instanceof t.BinaryExpression).toEqual(true);
      expect(
        unflattened.left instanceof t.Literal && unflattened.left.value == 1
      ).toEqual(true);
      expect(
        unflattened.right instanceof t.Literal && unflattened.right.value === 2
      ).toEqual(true);
    });
  });

  describe('assert', () => {
    it('should assert Type of value', () => {
      const literalValue = t.literal({ value: 0 });
      expect(t.assert(literalValue, t.Literal)).toEqual(literalValue);

      expect(() =>
        t.assert(t.literal({ value: 0 }), t.BinaryExpression)
      ).toThrow();

      expect(t.assert(literalValue, t.Literal, (v) => v.value)).toEqual(0);
    });
  });
});
