import * as t from '@composite/types';
import { observer } from '@composite/react';
import * as React from 'react';

import { useEditor } from '@app/editor';

import { View } from './view';
import { useConnectDOM } from './useConnecttDom';

import { ComponentContext } from '../ComponentContext';

type RenderErrorViewProps = {
  view: t.ErrorSystemView;
};

export const RenderErrorView = observer((props: RenderErrorViewProps) => {
  return (
    <div>
      <h4>Error: {props.view.error}</h4>
    </div>
  );
});

type RenderElementViewProps = {
  view: t.ElementView;
};

export const RenderElementView = observer((props: RenderElementViewProps) => {
  const { connect } = useConnectDOM();
  const domRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!domRef.current) {
      return;
    }

    return connect(domRef.current);
  }, [connect]);

  if (props.view.tag === 'text') {
    return <span ref={domRef}>{props.view.props.value as string}</span>;
  }

  return React.createElement(
    props.view.tag,
    {
      ...props.view.props,
      ref: domRef,
    },
    props.view.children.length > 0
      ? props.view.children.map((child) => (
          <Renderer view={child} key={child.key} />
        ))
      : undefined
  );
});

type RenderComponentViewProps = {
  view: t.ComponentView;
};

export const RenderComponentView = observer(
  (props: RenderComponentViewProps) => {
    let render: React.ReactElement[] | null = null;

    if (props.view instanceof t.CompositeComponentView) {
      render = props.view.render.map((r) => <Renderer view={r} key={r.id} />);
    }

    if (props.view instanceof t.ExternalComponentView) {
      render = props.view.component.render(props.view.props);
    }

    return (
      <ComponentContext.Provider value={props.view.component}>
        {render}
      </ComponentContext.Provider>
    );
  }
);

type RenderSlotViewProps = {
  view: t.SlotView;
};

export const RenderSlotView = observer((props: RenderSlotViewProps) => {
  return (
    <React.Fragment>
      {props.view.view.map((v) => (
        <Renderer view={v} key={v.id} />
      ))}
    </React.Fragment>
  );
});

type RendererProps = {
  view: t.View;
  onComponentRootDOMReady?: (elements: HTMLElement[]) => void;
};

export const Renderer = (props: RendererProps) => {
  let render: React.ReactElement | undefined;

  const editor = useEditor();

  if (props.view instanceof t.ElementView) {
    render = <RenderElementView view={props.view} />;
  }

  if (props.view instanceof t.ComponentView) {
    render = <RenderComponentView view={props.view} />;
  }

  if (props.view instanceof t.ErrorSystemView) {
    render = <RenderErrorView view={props.view} />;
  }

  if (props.view instanceof t.SlotView) {
    render = <RenderSlotView view={props.view} />;
  }

  React.useEffect(() => {
    const view = props.view;

    if (!props.onComponentRootDOMReady) {
      return;
    }

    if (!(view instanceof t.CompositeComponentView)) {
      return;
    }

    const tplElements = editor.activeComponentEditor?.activeFrame?.tplElements;

    const doms = view.render.flatMap((tpl) => [
      ...(tplElements?.get(tpl.template) ?? []),
    ]);

    props.onComponentRootDOMReady(doms ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.view.template,
    props.view,
    props.onComponentRootDOMReady,
    editor.activeComponentEditor?.activeFrame?.tplElements,
  ]);

  if (!render) {
    return null;
  }

  return <View view={props.view}>{render}</View>;
};
