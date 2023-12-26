import { Frame } from '@rekajs/core';
import { observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import * as React from 'react';

type RendererProps = {
  view: t.View;
};

export const Renderer = observer((props: RendererProps) => {
  if (props.view instanceof t.TagView) {
    if (props.view.tag === 'text') {
      return <span>{props.view.props.value}</span>;
    }

    return React.createElement(
      props.view.tag,
      props.view.props,
      props.view.children.map((child) => (
        <Renderer key={child.id} view={child} />
      ))
    );
  }

  if (props.view instanceof t.RekaComponentView) {
    return props.view.render.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ExternalComponentView) {
    return props.view.component.render(props.view.props);
  }

  if (props.view instanceof t.SlotView || props.view instanceof t.FragmentView) {
    return props.view.children.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ErrorSystemView) {
    return (
      <div className="">
        Something went wrong. <br />
        {props.view.error}
      </div>
    );
  }

  return null;
});

type RenderFrameProps = {
  frame: Frame;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
  if (!props.frame.view) {
    return null;
  }

  return <Renderer view={props.frame.view} />;
});
