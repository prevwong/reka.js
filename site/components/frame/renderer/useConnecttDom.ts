import * as t from '@composite/types';
import * as React from 'react';

import { useEditor } from '@app/editor';

import { useView } from './view';

import { ComponentContext } from '../ComponentContext';

export const useConnectDOM = () => {
  const editor = useEditor();

  const { component, parent: parentComponent } =
    React.useContext(ComponentContext);

  const {
    view,
    parent: parentView,
    isSelectable,
    isNonFrameComponentRoot,
  } = useView();

  const connect = React.useCallback(
    (dom: HTMLElement) => {
      const activeComponentEditor = editor.activeComponentEditor;

      if (!activeComponentEditor) {
        return;
      }

      const activeFrame = activeComponentEditor.activeFrame;

      if (!activeFrame) {
        return;
      }

      let template = view.template;

      const frameComponent = activeFrame.state.component;

      const isNonFrameRoot = () => {
        if (frameComponent.name === component.name) {
          return false;
        }

        if (parentView && parentView instanceof t.CompositeComponentView) {
          return parentView.render.indexOf(view) > -1;
        }
      };

      if (isNonFrameRoot()) {
        template = parentView?.template as any;
      }

      const shouldAddListeners = () => {
        if (component?.name === frameComponent.name) {
          return true;
        }

        if (
          parentComponent &&
          parentComponent.name === frameComponent.name &&
          parentView &&
          parentView instanceof t.CompositeComponentView
        ) {
          return parentView.render.indexOf(view) > -1;
        }

        return false;
      };

      return activeComponentEditor.connectTplDOM(
        dom,
        template,
        shouldAddListeners()
      );
    },
    [
      editor,
      component.name,
      parentView,
      view,
      isSelectable,
      isNonFrameComponentRoot,
      parentComponent,
    ]
  );

  return {
    connect,
  };
};
