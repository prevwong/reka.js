import {
  UserFrame,
  UserFrameExtension,
} from '@app/extensions/UserFrameExtension';
import * as t from '@composite/types';
import { Frame } from '@composite/state';
import {
  reaction,
  IReactionDisposer,
  makeObservable,
  action,
  computed,
  observable,
} from 'mobx';

import { Editor } from './Editor';

type ActiveFrame = {
  state: Frame;
  user: UserFrame;
  tplElements: WeakMap<t.Template, Set<HTMLElement>>;
};

type TplEvent = {
  selected: t.Template | null;
  hovered: t.Template | null;
};

export class ComponentEditor {
  activeFrame: ActiveFrame | null;
  frameToIframe: WeakMap<Frame, HTMLIFrameElement>;
  tplEvent: TplEvent;

  private disposeReaction: IReactionDisposer;

  constructor(readonly component: t.Component, readonly editor: Editor) {
    this.activeFrame = null;
    this.frameToIframe = new WeakMap();
    this.tplEvent = {
      selected: null,
      hovered: null,
    };

    this.disposeReaction = reaction(
      () => {
        return this.frameOptions.length;
      },
      (count, _, cb) => {
        if (count === 0) {
          return;
        }

        this.createInitialFrame();
        cb.dispose();
      },
      {
        fireImmediately: true,
      }
    );

    makeObservable(this, {
      createInitialFrame: action,
      frameOptions: computed,
      tplEvent: observable,
      setTplEvent: action,
      setActiveFrame: action,
      activeFrame: observable,
      frameToIframe: observable,
    });
  }

  dispose() {
    this.disposeReaction();
  }

  createInitialFrame() {
    const firstComponentUserFrame = this.frameOptions.find(
      (frame) => frame.name === this.component.name
    );

    if (!firstComponentUserFrame) {
      return;
    }

    let stateFrame =
      this.editor.state.frames.find(
        (frame) => frame.id === firstComponentUserFrame.id
      ) || null;

    if (!stateFrame) {
      stateFrame = this.editor.state.createFrame({
        id: firstComponentUserFrame.id,
        component: {
          name: this.component.name,
          props: firstComponentUserFrame.props,
        },
      });
    }

    this.activeFrame = {
      state: stateFrame,
      user: firstComponentUserFrame,
      tplElements: new WeakMap(),
    };
  }

  setActiveFrame(frameId: string) {
    const userFrame = this.frameOptions.find((frame) => frame.id === frameId);

    console.log('u', userFrame);

    if (!userFrame) {
      return;
    }

    let stateFrame =
      this.editor.state.frames.find((frame) => frame.id === frameId) || null;

    if (!stateFrame) {
      stateFrame = this.editor.state.createFrame({
        id: frameId,
        component: {
          name: this.component.name,
          props: userFrame.props,
        },
      });
    }

    this.activeFrame = {
      state: stateFrame,
      user: userFrame,
      tplElements: new WeakMap(),
    };
  }

  get frameOptions() {
    const userFrames =
      this.editor.state.getExtensionState(UserFrameExtension).frames;

    const availableUserFrames = userFrames.filter(
      (frame) => frame.name === this.component.name
    );

    return availableUserFrames;
  }

  setTplEvent(event: 'selected' | 'hovered', tpl: t.Template) {
    this.tplEvent[event] = tpl;
  }

  connectTplDOM(dom: HTMLElement, tpl: t.Template) {
    if (!this.activeFrame) {
      return () => {};
    }

    let set = this.activeFrame.tplElements.get(tpl);

    if (!set) {
      set = new Set();
    }

    this.activeFrame.tplElements.set(tpl, set);

    set.add(dom);

    return () => {
      if (!set) {
        return;
      }

      set.delete(dom);
    };
  }
}
