import * as React from 'react';
import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';

import { useView, View } from './view';
import { ComponentContext } from './ComponentContext';

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
  const { connect, className } = useView();

  if (props.view.tag === 'text') {
    return (
      <span
        className={className}
        ref={(dom) => {
          if (!dom) {
            return;
          }

          connect(dom);
        }}
      >
        {props.view.props.text as string}
      </span>
    );
  }

  return React.createElement(
    props.view.tag,
    {
      ...props.view.props,
      className: [props.view.props['className'], className]
        .filter(Boolean)
        .join(' '),
      ref: (dom) => {
        if (!dom) {
          return;
        }

        connect(dom);
      },
    },
    props.view.children.map((child) => (
      <Renderer view={child} key={child.key} />
    ))
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
};

export const Renderer = (props: RendererProps) => {
  let render;

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

  if (!render) {
    return null;
  }

  return <View view={props.view}>{render}</View>;
};
