import * as t from '@composite/types';
import * as React from 'react';

import { useEditor } from '@app/editor';

import { useView } from './view';

import { ComponentContext } from '../ComponentContext';

export const useConnectDOM = () => {
  const editor = useEditor();

  const component = React.useContext(ComponentContext);
  const { view, parent: parentView } = useView();

  const connect = React.useCallback(
    (dom: HTMLElement) => {
      if (!editor.activeComponentEditor) {
        return;
      }

      let template = view.template;

      const isNonFrameRoot = () => {
        if (
          editor.activeComponentEditor?.activeFrame?.state.component.name ===
          component.name
        ) {
          return false;
        }

        if (parentView && parentView instanceof t.CompositeComponentView) {
          return parentView.render.indexOf(view) > -1;
        }
      };

      if (isNonFrameRoot()) {
        template = parentView?.template as any;
      }

      return editor.activeComponentEditor.connectTplDOM(dom, template);
    },
    [editor, component.name, parentView, view]
  );

  return {
    connect,
  };
};
