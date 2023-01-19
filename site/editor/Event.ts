import { Frame } from '@rekajs/state';
import * as t from '@rekajs/types';
import { makeObservable, observable, runInAction } from 'mobx';

type EventState = {
  selected: Set<t.Template>;
  hovered: Set<t.Template>;
  dragged: Set<t.Template>;
};

export class Event {
  state: EventState;

  private tplToElement: Map<t.Template, Set<HTMLElement>>;
  private registeredElement: WeakMap<
    HTMLElement,
    { cleanup: () => void; template: t.Template }
  >;

  constructor(readonly frame: Frame) {
    this.state = {
      selected: new Set(),
      hovered: new Set(),
      dragged: new Set(),
    };

    this.tplToElement = new Map();
    this.registeredElement = new WeakMap();

    makeObservable(this, {
      state: observable,
    });
  }

  private setEvent(event: keyof EventState, template: t.Template) {
    runInAction(() => {
      if (event === 'hovered') {
        this.state[event].clear();
      }

      this.state[event].add(template);
    });
  }

  private removeEvent(event: keyof EventState, templateId: t.Template) {
    runInAction(() => {
      this.state[event].delete(templateId);
    });
  }

  private clearEvent(event: keyof EventState) {
    runInAction(() => {
      this.state[event].clear();
    });
  }

  connect(dom: HTMLElement, template: t.Template) {
    const existingRegisteredElement = this.registeredElement.get(dom);

    if (existingRegisteredElement) {
      if (existingRegisteredElement.template === template) {
        return;
      }

      existingRegisteredElement.cleanup();
    }

    let tplToElements = this.tplToElement.get(template);

    if (!tplToElements) {
      tplToElements = new Set();
      this.tplToElement.set(template, tplToElements);
    }

    tplToElements.add(dom);

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      this.clearEvent('selected');
      this.setEvent('selected', template);
    };

    const onMouseOver = (e: MouseEvent) => {
      e.stopPropagation();
      this.setEvent('hovered', template);
    };

    const onMouseOut = (e: MouseEvent) => {
      e.stopPropagation();
      this.removeEvent('hovered', template);
    };

    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('mouseover', onMouseOver);
    dom.addEventListener('mouseout', onMouseOut);

    const cleanup = () => {
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('mouseover', onMouseOver);
      dom.removeEventListener('mouseout', onMouseOut);
    };

    this.registeredElement.set(dom, {
      template,
      cleanup,
    });
  }
}
