import { generateRandomName } from '@app/utils';
import { WebrtcProvider } from 'y-webrtc';
import { Frame, State } from '@composite/state';
import {
  action,
  makeObservable,
  observable,
  runInAction,
  computed,
} from 'mobx';
import randomColor from 'randomcolor';
import shortUUID from 'short-uuid';
import { Event } from './Event';

export type User = {
  id: string;
  name: string;
  color: string;
};

export class Editor {
  activeFrame: Frame | null;
  user: User;
  peers: User[];
  connected: boolean;
  frameToEvent: WeakMap<Frame, Event>;

  constructor(readonly state: State, readonly provider: WebrtcProvider) {
    this.activeFrame = null;

    this.user = {
      id: shortUUID().generate(),
      name: generateRandomName(),
      color: randomColor({
        luminosity: 'dark',
        format: 'rgba',
      }),
    };

    this.broadcastLocalUser();
    this.peers = this.getPeers();
    this.connected = true;
    this.frameToEvent = new WeakMap();

    makeObservable(this, {
      activeFrame: observable,
      setActiveFrame: action,
      peers: observable,
      connected: observable,
      setConnected: action,
      allUsers: computed,
    });

    this.listenAwareness();
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
}
