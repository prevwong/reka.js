import * as t from '@rekajs/types';

import { Parser } from '../parser';

describe('Parser', () => {
  it('should be able to parse expressions', () => {
    expect(Parser.parseExpression('1+counter')).toMatchObject({
      type: 'BinaryExpression',
      id: expect.any(String),
      left: {
        type: 'Literal',
        id: expect.any(String),
        value: 1,
        meta: {},
      },
      meta: {},
      operator: '+',
      right: {
        type: 'Identifier',
        id: expect.any(String),
        name: 'counter',
        meta: {},
      },
    } as t.BinaryExpression);
  });
  it('should be able to parse program', () => {
    expect(
      Parser.parseProgram(`
      component App(prop1="defaultValue") {
          val counter = 0;
      } => (
          <div>
            <Button text={prop1} />
          </div>
      )
      `)
    ).toMatchObject({
      type: 'Program',
      components: [
        {
          type: 'RekaComponent',
          name: 'App',
          state: [
            {
              type: 'Val',
              name: 'counter',
              init: {
                type: 'Literal',
                value: 0,
              },
            },
          ],
          props: [
            {
              type: 'ComponentProp',
              name: 'prop1',
              init: {
                type: 'Literal',
                value: 'defaultValue',
              },
            },
          ],
          template: {
            type: 'TagTemplate',
            tag: 'div',
            props: {},
            children: [
              {
                type: 'ComponentTemplate',
                component: {
                  type: 'Identifier',
                  name: 'Button',
                },
                props: {
                  text: { type: 'Identifier', name: 'prop1' },
                },
              },
            ],
          },
        },
      ],
    });
  });
  it('should be able to parse variable kind', () => {
    expect(
      Parser.parseProgram(`
      val color: string = "blue";
      val colors: array<string> = ["blue"];
      val option: enum<{blue: "Blue", red: "Red"}> = "red";
    `)
    ).toMatchObject({
      type: 'Program',
      globals: [
        {
          type: 'Val',
          name: 'color',
          kind: {
            type: 'PrimitiveKind',
            primitive: 'string',
          },
          init: {
            type: 'Literal',
            value: 'blue',
          },
        },
        {
          type: 'Val',
          name: 'colors',
          kind: {
            type: 'ArrayKind',
            param: {
              type: 'PrimitiveKind',
              primitive: 'string',
            },
          },
          init: {
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 'blue' }],
          },
        },
        {
          type: 'Val',
          name: 'option',
          kind: {
            type: 'EnumKind',
            values: {
              blue: 'Blue',
              red: 'Red',
            },
          },
          init: {
            type: 'Literal',
            value: 'red',
          },
        },
      ],
    });
  });
});
