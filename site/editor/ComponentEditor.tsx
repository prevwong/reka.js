import { Frame } from '@rekajs/core';
import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { makeObservable, action, observable } from 'mobx';

import { CommentExtension } from '@app/extensions/CommentExtension';
import {
  UserFrame,
  UserFrameExtension,
} from '@app/extensions/UserFrameExtension';

import { Editor } from './Editor';

export type ActiveFrame = {
  state: Frame;
  user: UserFrame;
  tplElements: Map<t.Template, Set<HTMLElement>>;
  templateToShowComments: t.Template | null;
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
      showComments: action,
      hideComments: action,
      connectTplDOM: action,
    });

    const userFrameExtension =
      this.editor.reka.getExtension(UserFrameExtension);

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
    const firstUserFrame = this.editor.reka
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

    const userFrame = this.editor.reka
      .getExtension(UserFrameExtension)
      .state.frames.find((frame) => frame.id === frameId);

    if (!userFrame) {
      return;
    }

    const stateFrame =
      this.editor.reka.frames.find((frame) => frame.id === frameId) || null;

    invariant(stateFrame, 'State frame not found');

    this.activeFrame = {
      state: stateFrame,
      user: userFrame,
      tplElements: new Map(),
      templateToShowComments: null,
    };
  }

  setTplEvent(event: 'selected' | 'hovered', tpl: t.Template | null) {
    this.tplEvent[event] = tpl;
  }

  connectTplDOM(
    dom: HTMLElement,
    tpl: t.Template,
    addListeners: boolean = false
  ) {
    if (!this.activeFrame) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }

    let set = this.activeFrame.tplElements.get(tpl);

    if (!set) {
      set = new Set();
      this.activeFrame.tplElements.set(tpl, set);
    }

    set.add(dom);

    const mouseoverListener = (e: MouseEvent) => {
      e.stopPropagation();
      this.setTplEvent('hovered', tpl);
    };

    const mousedownListener = (e: MouseEvent) => {
      e.stopPropagation();
      this.setTplEvent('selected', tpl);
    };

    const mouseoutListener = (e: MouseEvent) => {
      e.stopPropagation();
      if (this.tplEvent.hovered?.id !== tpl.id) {
        return;
      }

      this.setTplEvent('hovered', tpl);
    };

    if (addListeners) {
      dom.addEventListener('mouseover', mouseoverListener);
      dom.addEventListener('mousedown', mousedownListener);
      dom.addEventListener('mouseout', mouseoutListener);
    }

    return () => {
      if (!set) {
        return;
      }

      dom.removeEventListener('mouseover', mouseoverListener);
      dom.removeEventListener('mousedown', mousedownListener);
      dom.removeEventListener('mouseout', mouseoutListener);

      set.delete(dom);
    };
  }

  showComments(tpl: t.Template) {
    if (!this.activeFrame) {
      return;
    }

    this.activeFrame.templateToShowComments = tpl;
  }

  hideComments() {
    if (!this.activeFrame) {
      return;
    }

    this.activeFrame.templateToShowComments = null;
  }

  getCommentCount(tpl: t.Template) {
    return (
      this.editor.reka.getExtension(CommentExtension).state.templateToComments[
        tpl.id
      ]?.length ?? 0
    );
  }
}
