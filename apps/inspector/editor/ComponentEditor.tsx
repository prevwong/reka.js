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
  private disposeActiveFrameRemoval: IReactionDisposer;

  constructor(readonly component: t.Component, readonly editor: Editor) {
    this.activeFrame = null;
    this.frameToIframe = new WeakMap();
    this.tplEvent = {
      selected: null,
      hovered: null,
    };

    makeObservable(this, {
      createInitialFrame: action,
      frameOptions: computed,
      tplEvent: observable,
      setTplEvent: action,
      setActiveFrame: action,
      activeFrame: observable,
      frameToIframe: observable,
    });

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

    this.disposeActiveFrameRemoval = reaction(
      () => {
        if (!this.activeFrame?.user) {
          return false;
        }

        return this.frameOptions.indexOf(this.activeFrame.user) > -1
          ? false
          : true;
      },
      (bool) => {
        if (!bool) {
          return;
        }

        this.setActiveFrame(null);
      }
    );
  }

  dispose() {
    this.disposeReaction();
    this.disposeActiveFrameRemoval();
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

  setActiveFrame(frameId: string | null) {
    if (!frameId) {
      this.activeFrame = null;
      return;
    }

    const userFrame = this.frameOptions.find((frame) => frame.id === frameId);

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

  setTplEvent(event: 'selected' | 'hovered', tpl: t.Template | null) {
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
