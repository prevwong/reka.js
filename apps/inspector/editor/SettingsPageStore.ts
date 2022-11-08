import {
  UserFrame,
  UserFrameExtension,
} from '@app/extensions/UserFrameExtension';
import { Frame } from '@composite/state';
import * as t from '@composite/types';

import { makeObservable, observable, action } from 'mobx';
import { Editor } from './Editor';

type ComponentSettingsRoute = {
  type: 'component';
  component: t.Component;
};

type TemplateSettingsRoute = {
  type: 'template';
  template: t.Template;
};

export type SettingsRoute = ComponentSettingsRoute | TemplateSettingsRoute;

type SelectedFrame = {
  state: Frame;
  userData: UserFrame;
  iframe: HTMLIFrameElement | null;
};

type ActiveView = {
  component: t.Component;
  frame: SelectedFrame | null;
  availableUserFrames: UserFrame[];
  template: t.Template | null;
};

export class SettingsPageStore {
  active: ActiveView | null;

  constructor(readonly editor: Editor) {
    this.active = null;

    makeObservable(this, {
      active: observable,
      setComponent: action,
      setTemplate: action,
      registerIframe: action,
    });
  }

  setComponent(component: t.Component) {
    if (this.active?.component === component) {
      return;
    }

    let frame: SelectedFrame | null = null;

    const userFrames =
      this.editor.state.getExtensionState(UserFrameExtension).frames;

    const availableUserFrames = userFrames.filter(
      (frame) => frame.name === component.name
    );

    const firstComponentUserFrame = availableUserFrames.find(
      (frame) => frame.name === component.name
    );

    if (firstComponentUserFrame) {
      let stateFrame =
        this.editor.state.frames.find(
          (frame) => frame.id === firstComponentUserFrame.id
        ) || null;

      if (!stateFrame) {
        stateFrame = this.editor.state.createFrame({
          id: firstComponentUserFrame.id,
          component: {
            name: component.name,
            props: firstComponentUserFrame.props,
          },
        });
      }

      frame = {
        iframe: null,
        state: stateFrame,
        userData: firstComponentUserFrame,
      };
    }

    this.active = {
      component,
      frame,
      availableUserFrames,
      template: null,
    };
  }

  setTemplate(template: t.Template) {
    if (!this.active) {
      return;
    }

    this.active.template = template;
  }

  registerIframe(dom: HTMLIFrameElement) {
    if (!this.active?.frame) {
      return;
    }

    this.active.frame.iframe = dom;
  }
}
