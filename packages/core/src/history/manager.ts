import { action, makeObservable, observable } from 'mobx';

import { Reka } from '../reka';

export type HistoryManagerStatus = {
  undoable: boolean;
  redoable: boolean;
};

export abstract class HistoryManager {
  status: HistoryManagerStatus;

  constructor(readonly reka: Reka) {
    this.status = {
      undoable: false,
      redoable: false,
    };

    makeObservable(this, {
      status: observable,
      setStatus: action,
    });
  }

  abstract undo(): void;
  abstract redo(): void;

  setStatus(cb: (status: HistoryManagerStatus) => void) {
    cb(this.status);
  }

  init?(): void;
  dispose?(): void;
}
