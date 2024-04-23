import { Frame, Reka } from '@rekajs/core';
import * as t from '@rekajs/types';
import confetti from 'canvas-confetti';
import {
  action,
  makeObservable,
  observable,
  runInAction,
  computed,
} from 'mobx';
import { NextRouter } from 'next/router';
import randomColor from 'randomcolor';
import * as React from 'react';
import shortUUID from 'short-uuid';
import { WebrtcProvider } from 'y-webrtc';

import { createSharedStateGlobals } from '@app/constants';
import { CollabExtension } from '@app/extensions/CollabExtension';
import { UserAnimation } from '@app/external/UserAnimation';
import { UserIcon } from '@app/external/UserIcon';
import {
  generateRandomName,
  getCollaborativeYjsDocument,
  getCollaborativeYjsRekaState,
  getCollabRoomId,
} from '@app/utils';

import { ComponentEditor } from './ComponentEditor';
import { Event } from './Event';

export type User = {
  id: string;
  name: string;
  color: string;
};

export enum EditorMode {
  Preview = 'preview',
  UI = 'ui',
  Code = 'code',
}

type IframEventListeners = Array<{
  type: string;
  handler: EventListenerOrEventListenerObject;
}>;

export class Editor {
  compactSidebar: boolean = false;
  compactSidebarVisible: boolean = false;

  activeFrame: Frame | null;
  user: User;
  peers: User[];
  connected: boolean;
  frameToEvent: WeakMap<Frame, Event>;
  componentToComponentEditor: WeakMap<t.Component, ComponentEditor>;
  activeComponentEditor: ComponentEditor | null;
  iframe: HTMLIFrameElement | null;
  mode: EditorMode;
  ready: boolean;
  reka: Reka;

  private declare provider: WebrtcProvider;
  private declare windowResizeHandler: () => void;
  private iframeEventHandlers: IframEventListeners = [];
  private declare disposeHandleRouteChange: () => void;

  constructor(readonly router: NextRouter) {
    this.activeFrame = null;

    if (router.pathname === '/') {
      this.mode = EditorMode.Preview;
      this.ready = false;
    } else {
      this.mode = EditorMode.UI;
      this.ready = true;
    }

    this.user = {
      id: shortUUID().generate(),
      name: generateRandomName(),
      color: randomColor({
        luminosity: 'dark',
        hue: 'random',
        format: 'hex',
      }),
    };

    this.peers = [];
    this.connected = true;
    this.frameToEvent = new WeakMap();
    this.componentToComponentEditor = new WeakMap();
    this.activeComponentEditor = null;
    this.iframe = null;

    makeObservable(this, {
      compactSidebar: observable,
      compactSidebarVisible: observable,
      showCompactSidebar: action,
      activeFrame: observable,
      setActiveFrame: action,
      peers: observable,
      connected: observable,
      setConnected: action,
      setMode: action,
      mode: observable,
      allUsers: computed,
      activeComponentEditor: observable,
      setActiveComponentEditor: action,
      ready: observable,
      setReady: action,
      dispose: action,
    });

    this.reka = Reka.create({
      kinds: {
        Color: {
          validate(field) {
            return field.string((value) => value.startsWith('#'));
          },
        },
      },
      ...createSharedStateGlobals({
        externals: {
          components: [
            t.externalComponent({
              name: 'Animation',
              render: () => {
                return <UserAnimation />;
              },
            }),
            t.externalComponent({
              name: 'Icon',
              props: [
                t.componentProp({
                  name: 'name',
                  kind: t.stringKind(),
                }),
              ],
              render: (props: { name: string }) => {
                return <UserIcon name={props.name} />;
              },
            }),
          ],
          states: [
            t.externalState({
              name: 'scrollTop',
              init: 0,
            }),
          ],
          functions: (self) => {
            return [
              t.externalFunc({
                name: 'confetti',
                func: () => {
                  confetti();
                },
              }),
              t.externalFunc({
                name: 'getScrollTop',
                func: () => {
                  return self.getExternalState('scrollTop');
                },
              }),
              t.externalFunc({
                name: 'getPosts',
                func: () => {
                  return self.getExternalState('posts');
                },
              }),
            ];
          },
        },
        extensions: [CollabExtension],
      }),
    });

    this.reka.load(
      t.unflatten(getCollaborativeYjsRekaState().toJSON() as any),
      {
        sync: false,
      }
    );

    if (this.reka.program.components.length > 0) {
      let component = this.reka.program.components[0];

      if (router.query.component) {
        component =
          this.reka.program.components.find(
            (component) => component.name === router.query.component
          ) || component;
      }

      this.setActiveComponentEditor(component);
    }

    this.setupComponentRouteListener();

    if (typeof window === 'undefined') {
      return;
    }

    this.windowResizeHandler = () => {
      if (document.body.clientWidth <= 1100) {
        runInAction(() => {
          this.compactSidebar = true;
          this.compactSidebarVisible = false;
        });

        return;
      }

      runInAction(() => {
        this.compactSidebar = false;
        this.compactSidebarVisible = false;
      });
    };

    this.windowResizeHandler();
    window.addEventListener('resize', this.windowResizeHandler);

    const provider = new WebrtcProvider(
      getCollabRoomId(),
      getCollaborativeYjsDocument()
    );

    this.provider = provider;

    this.peers = this.getPeers();
    this.broadcastLocalUser();
    this.listenAwareness();

    (window as any).editor = this;
  }

  private setupComponentRouteListener() {
    const handleRouteChange = (path: string) => {
      const matchedPattern = path.match(/\/?component=(\w+)/);

      if (!matchedPattern) {
        this.setActiveComponentEditor(this.reka.program.components[0]);
        return;
      }

      const name = matchedPattern[1];

      const matchingComponent = this.reka.program.components.find(
        (component) => component.name === name
      );

      if (!matchingComponent) {
        this.router.replace('/');
        this.setActiveComponentEditor(this.reka.program.components[0]);
        return;
      }

      this.setActiveComponentEditor(matchingComponent);
    };

    this.router.events.on('routeChangeComplete', handleRouteChange);

    this.disposeHandleRouteChange = () => {
      this.router.events.off('routeChangeComplete', handleRouteChange);
    };
  }

  showCompactSidebar(bool: boolean) {
    this.compactSidebarVisible = bool;
  }

  setReady(bool: boolean) {
    this.ready = bool;
  }

  dispose() {
    if (this.disposeHandleRouteChange) {
      this.disposeHandleRouteChange();
    }

    this.reka.dispose();

    if (typeof window === 'undefined') {
      return;
    }

    this.removeIframeEventListeners();
    this.provider.disconnect();
    this.provider.destroy();
    window.removeEventListener('resize', this.windowResizeHandler);

    this.frameToEvent = new WeakMap();
    this.componentToComponentEditor = new WeakMap();
    this.activeComponentEditor = null;
    this.iframe = null;
  }

  private addIframeEventListeners() {
    this.iframeEventHandlers.forEach((listener) => {
      this.iframe?.contentWindow?.addEventListener(
        listener.type,
        listener.handler
      );
    });
  }

  private removeIframeEventListeners() {
    this.iframeEventHandlers.forEach((h) => {
      this.iframe?.contentWindow?.removeEventListener(h.type, h.handler);
    });
  }

  registerIframe(iframe: HTMLIFrameElement) {
    if (!iframe) {
      return;
    }

    if (this.iframe) {
      this.removeIframeEventListeners();
    }

    this.iframe = iframe;

    const iframeScrollTopListener = () => {
      if (!this.iframe) {
        return;
      }

      const scrollY = this.iframe?.contentDocument?.documentElement.scrollTop;

      this.reka.updateExternalState('scrollTop', scrollY);
    };

    const iframePropagateEventHandler = (e: any) => {
      window.dispatchEvent(new e.constructor(e.type, e));
      // todo: hack
      window.dispatchEvent(new e.constructor('mousedown', e));
    };

    this.iframeEventHandlers = [
      { type: 'scroll', handler: iframeScrollTopListener },
      { type: 'click', handler: iframePropagateEventHandler },
    ];

    this.addIframeEventListeners();
  }

  private broadcastLocalUser() {
    this.provider.awareness.setLocalState({
      user: this.user,
    });
  }

  private getPeers() {
    const states = this.provider.awareness.getStates().values();

    const users: any[] = [];

    for (const state of states) {
      if (!state.user) {
        continue;
      }

      if (state.user.id === this.user.id) {
        continue;
      }

      users.push(state.user);
    }

    return users;
  }

  private listenAwareness() {
    this.provider.awareness.on('change', () => {
      runInAction(() => {
        this.peers = this.getPeers();
      });
    });
  }

  get allUsers() {
    return [this.user, ...this.peers];
  }

  getUserById(id: string) {
    return this.allUsers.find((user) => user.id === id);
  }

  setActiveFrame(frame: Frame | null) {
    this.activeFrame = frame;
  }

  setConnected(connected: boolean) {
    if (!connected) {
      this.provider.disconnect();
      this.peers = [];
    } else {
      this.provider.connect();
      this.broadcastLocalUser();
      this.peers = this.getPeers();
    }

    this.connected = connected;
  }

  setMode(mode: EditorMode) {
    this.mode = mode;
  }

  toggleConnected() {
    this.setConnected(!this.connected);
  }

  getEvent(frame: Frame) {
    let event = this.frameToEvent.get(frame);

    if (!event) {
      event = new Event(frame);
      this.frameToEvent.set(frame, event);
    }

    return event;
  }

  setActiveComponentEditorByName(name: string) {
    const component = this.reka.program.components.find(
      (component) => component.name === name
    );

    if (!component) {
      return false;
    }

    this.setActiveComponentEditor(component);
    return true;
  }

  setActiveComponentEditor(component: t.Component) {
    let componentEditor = this.componentToComponentEditor.get(component);

    if (!componentEditor) {
      componentEditor = new ComponentEditor(component, this);
      this.componentToComponentEditor.set(component, componentEditor);
    }

    this.activeComponentEditor = componentEditor;

    return componentEditor;
  }
}
