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
});
