import { Frame } from '@composite/state';
import * as t from '@composite/types';
import { makeObservable, action, observable } from 'mobx';
import invariant from 'tiny-invariant';

import {
  UserFrame,
  UserFrameExtension,
} from '@app/extensions/UserFrameExtension';

import { Editor } from './Editor';

export type ActiveFrame = {
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

  private disposeActiveFrameRemoval: () => void;

  constructor(readonly component: t.Component, readonly editor: Editor) {
    this.activeFrame = null;
    this.frameToIframe = new WeakMap();
    this.tplEvent = {
      selected: null,
      hovered: null,
    };

    makeObservable(this, {
      tplEvent: observable,
      setTplEvent: action,
      setActiveFrame: action,
      activeFrame: observable,
      frameToIframe: observable,
    });

    const userFrameExtension =
      this.editor.composite.getExtension(UserFrameExtension);

    this.disposeActiveFrameRemoval = userFrameExtension.subscribe(
      (state) => ({
        framesCount: state.frames.length,
      }),
      (collected, prevCollected) => {
        if (collected.framesCount >= prevCollected.framesCount) {
          return;
        }

        if (!this.activeFrame?.user) {
          return;
        }

        // Check if current active frame has been deleted
        const isActiveFrameDeleted = !userFrameExtension.state.frames.find(
          (frame) => frame.id === this.activeFrame?.user.id
        );

        if (!isActiveFrameDeleted) {
          return;
        }

        this.setActiveFrame(null);
      }
    );

    this.setInitialActiveFrame();
  }

  setInitialActiveFrame() {
    const firstUserFrame = this.editor.composite
      .getExtension(UserFrameExtension)
      .state.frames.filter((frame) => frame.name === this.component.name)[0];

    if (!firstUserFrame) {
      return;
    }

    this.setActiveFrame(firstUserFrame.id);
  }

  dispose() {
    this.disposeActiveFrameRemoval();
  }

  setActiveFrame(frameId: string | null) {
    if (!frameId) {
      this.activeFrame = null;
      return;
    }

    const userFrame = this.editor.composite
      .getExtension(UserFrameExtension)
      .state.frames.find((frame) => frame.id === frameId);

    if (!userFrame) {
      return;
    }

    const stateFrame =
      this.editor.composite.frames.find((frame) => frame.id === frameId) ||
      null;

    invariant(stateFrame, 'State frame not found');

    this.activeFrame = {
      state: stateFrame,
      user: userFrame,
      tplElements: new WeakMap(),
    };
  }

  setTplEvent(event: 'selected' | 'hovered', tpl: t.Template | null) {
    this.tplEvent[event] = tpl;
  }

  connectTplDOM(dom: HTMLElement, tpl: t.Template) {
    if (!this.activeFrame) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
