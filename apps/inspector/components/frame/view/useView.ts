import * as t from '@composite/types';
import { autorun } from 'mobx';
import * as React from 'react';

import { useEditor } from '@app/editor';

import { ViewContext } from './ViewContext';

import { ComponentContext } from '../ComponentContext';
import { FrameContext } from '../FrameContext';

export const useView = () => {
  const frame = React.useContext(FrameContext);
  const component = React.useContext(ComponentContext);
  const { view, parent: parentView } = React.useContext(ViewContext);

  const editor = useEditor();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const isSelectable = React.useMemo(
    () => frame.component.name === component.name,
    [frame, component]
  );

  const isNonFrameComponentRoot = React.useMemo(() => {
    if (frame.component.name === component.name) {
      return false;
    }

    if (parentView && parentView instanceof t.CompositeComponentView) {
      return parentView.render.indexOf(view) > -1;
    }
  }, [frame, parentView, view, component.name]);

  const connect = React.useMemo(() => {
    return (dom: HTMLElement) => {
      if (!isSelectable && !isNonFrameComponentRoot) {
        return;
      }

      let template = view.template;

      if (isNonFrameComponentRoot) {
        template = parentView?.template as any;
      }

      editor.getEvent(frame).connect(dom, template);
    };
  }, [editor, frame, view, isSelectable, isNonFrameComponentRoot, parentView]);

  React.useEffect(() => {
    return autorun(() => {
      let isSelected: boolean;

      if (isNonFrameComponentRoot) {
        isSelected = editor
          .getEvent(frame)
          .state.selected.has(parentView?.template as any);
      } else {
        isSelected = editor.getEvent(frame).state.selected.has(view.template);
      }

      setIsSelected(isSelected);
    });
  }, [
    editor,
    frame,
    isNonFrameComponentRoot,
    view.template,
    parentView?.template,
  ]);

  React.useEffect(() => {
    return autorun(() => {
      let isHovered: boolean;

      if (isNonFrameComponentRoot) {
        isHovered = editor
          .getEvent(frame)
          .state.hovered.has(parentView?.template as any);
      } else {
        isHovered = editor.getEvent(frame).state.hovered.has(view.template);
      }

      setIsHovered(isHovered);
    });
  }, [
    editor,
    frame,
    isNonFrameComponentRoot,
    view.template,
    parentView?.template,
  ]);

  const classes = [
    isSelected && 'template-selected',
    isHovered && 'template-hovered',
  ];

  return {
    connect,
    className: classes.filter(Boolean).join(' '),
  };
};
