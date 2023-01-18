import { observer } from '@composite/react';
import { Frame } from '@composite/state';
import * as t from '@composite/types';
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

  if (props.view instanceof t.CompositeComponentView) {
    return props.view.render.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ExternalComponentView) {
    return props.view.component.render(props.view.props);
  }

  if (props.view instanceof t.SlotView) {
    return props.view.view.map((r) => <Renderer key={r.id} view={r} />);
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

  console.log('frame', props.frame);

  return <Renderer view={props.frame.view} />;
});
