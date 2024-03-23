import { it, expect, describe } from 'vitest';
import React from '../core/react';

describe('create element', () => {
  it('should return element vdom when props is null', () => {
    const el = React.createElement('div', null, 'Hello React!');

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello React!",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
        },
        "type": "div",
      }
    `)
  })

  it('should return element vdom when element has children', () => {
    const el = React.createElement('div', { id: 'app' }, 'Hello React!');

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello React!",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `)
  })

  it('should return element vdom when children have children', () => {
    const elementGrandson = React.createElement('div', { id: 'grandson' }, 'Hello React!');
    const elementSon = React.createElement('div', { id: 'son' }, elementGrandson);
    const element = React.createElement('div', { id: 'app' }, elementSon);

    expect(element).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [
                  {
                    "props": {
                      "children": [
                        {
                          "props": {
                            "children": [],
                            "nodeValue": "Hello React!",
                          },
                          "type": "TEXT_ELEMENT",
                        },
                      ],
                      "id": "grandson",
                    },
                    "type": "div",
                  },
                ],
                "id": "son",
              },
              "type": "div",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `)
  })

})
