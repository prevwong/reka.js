import { Frame, Composite } from '@composite/state';
import * as t from '@composite/types';
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
import { UserHeader } from '@app/external/UserHeader';
import { UserIcon } from '@app/external/UserIcon';
import {
  generateRandomName,
  getCollaborativeYjsDocument,
  getCollaborativeYjsCompositeState,
} from '@app/utils';

import { ComponentEditor } from './ComponentEditor';
import { Event } from './Event';

export type User = {
  id: string;
  name: string;
  color: string;
};

export enum EditorMode {
  Code = 'code',
  UI = 'ui',
  Preview = 'preview',
}

export class Editor {
  activeFrame: Frame | null;
  user: User;
  peers: User[];
  connected: boolean;
  frameToEvent: WeakMap<Frame, Event>;

  componentToComponentEditor: WeakMap<t.Component, ComponentEditor>;
  activeComponentEditor: ComponentEditor | null;
  iframe: HTMLIFrameElement | null;

  mode: EditorMode;

  declare provider: WebrtcProvider;

  composite: Composite;

  private declare iframeScrollTopListener;

  ready: boolean;

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
        format: 'rgba',
      }),
    };

    this.peers = [];
    this.connected = true;
    this.frameToEvent = new WeakMap();

    this.componentToComponentEditor = new WeakMap();
    this.activeComponentEditor = null;
    this.iframe = null;

    makeObservable(this, {
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
    });

    this.composite = new Composite({
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
              name: 'Header',
              render: () => {
                return <UserHeader />;
              },
            }),
            t.externalComponent({
              name: 'Icon',
              render: (props: { name: string }) => {
                return <UserIcon name={props.name} />;
              },
            }),
          ],
          states: {
            scrollTop: 0,
          },
          globals: (self) => {
            return {
              confetti: () => {
                confetti();
              },
              getScrollTop: () => {
                return self.getExternalState('scrollTop');
              },
            };
          },
        },
        extensions: [CollabExtension],
      }),
    });

    this.composite.load(
      t.unflatten(getCollaborativeYjsCompositeState().toJSON() as any),
      false
    );

    if (this.composite.program.components.length > 0) {
      this.setActiveComponentEditor(this.composite.program.components[0]);
    }

    if (typeof window === 'undefined') {
      return;
    }

    const provider = new WebrtcProvider(
      'composite-yjs-test',
      getCollaborativeYjsDocument()
    );

    this.provider = provider;

    this.peers = this.getPeers();
    this.broadcastLocalUser();
    this.listenAwareness();
  }

  setReady(bool: boolean) {
    this.ready = bool;
  }

  dispose() {
    if (!this.provider) {
      return;
    }

    this.composite.dispose();
    this.provider.disconnect();
    this.provider.destroy();
  }

  registerIframe(iframe: HTMLIFrameElement) {
    if (!iframe) {
      return;
    }

    if (this.iframe && this.iframeScrollTopListener) {
      this.iframe.contentWindow?.removeEventListener(
        'scroll',
        this.iframeScrollTopListener
      );
    }

    this.iframe = iframe;

    this.iframeScrollTopListener = () => {
      if (!this.iframe) {
        return;
      }

      const scrollY = this.iframe?.contentDocument?.documentElement.scrollTop;

      this.composite.updateExternalState('scrollTop', scrollY);
    };

    this.iframe.contentWindow?.addEventListener(
      'scroll',
      this.iframeScrollTopListener
    );
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
