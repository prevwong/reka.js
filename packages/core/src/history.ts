import { invariant } from '@rekajs/utils';

import { OnChangePayload, Path } from './observer';
import { Reka } from './reka';

export abstract class HistoryManager {
  constructor(readonly reka: Reka) {
    if (this.init) {
      this.init();
    }
  }

  abstract undo(): void;
  abstract redo(): void;

  abstract canUndo(): boolean;
  abstract canRedo(): boolean;

  init?(): void;
  dispose?(): void;
}

type HistoryChangeset = {
  timestamp: number;
  changes: OnChangePayload[];
};

export class DefaultHistoryManager extends HistoryManager {
  private stack: HistoryChangeset[] = [];
  private pointer = -1;

  declare disposeListener: () => void;

  init() {
    this.disposeListener = this.reka.listenToChanges2((payload) => {
      if (payload.changes.length <= 0) {
        return;
      }

      this.stack.push({
        timestamp: Date.now(),
        changes: payload.changes,
      });

      this.pointer++;
      this.stack.length = this.pointer + 1;
    });
  }

  dispose() {
    this.disposeListener();
  }

  private getValueFromPath(paths: Path[]) {
    const traverse = (value: any, i = 0) => {
      if (i === paths.length) {
        return value;
      }

      invariant(value !== undefined);

      const path = paths[i];

      return traverse(value[path.key], i + 1);
    };

    return traverse(this.reka.state);
  }

  applyInverse(change: OnChangePayload) {
    const pathObj = this.getValueFromPath(change.path);

    if (change.type === 'add') {
      delete pathObj[change.name];
      return;
    }

    if (change.type === 'remove') {
      pathObj[change.name] = change.oldValue;
      return;
    }

    if (change.type === 'update' && change.observableKind === 'object') {
      pathObj[change.name] = change.oldValue;
      return;
    }

    if (change.type === 'update' && change.observableKind === 'array') {
      pathObj[change.index] = change.oldValue;
    }

    if (change.type === 'splice') {
      pathObj.splice(change.index, change.addedCount);
      pathObj.splice(change.index, 0, ...change.removed);
      return;
    }

    throw new Error('Unknown inverse op');
  }

  apply(change: OnChangePayload) {
    const pathObj = this.getValueFromPath(change.path);

    if (change.type === 'add') {
      pathObj[change.name] = change.newValue;
      return;
    }

    if (change.type === 'remove') {
      delete pathObj[change.name];
      return;
    }

    if (change.type === 'update' && change.observableKind === 'object') {
      pathObj[change.name] = change.newValue;
      return;
    }

    if (change.type === 'update' && change.observableKind === 'array') {
      pathObj[change.index] = change.newValue;
    }

    if (change.type === 'splice') {
      pathObj.splice(change.index, change.removedCount);
      pathObj.splice(change.index, 0, ...change.added);
      return;
    }

    throw new Error('Unknown op');
  }

  undo() {
    if (this.pointer < 0) {
      return;
    }

    const head = this.stack[this.pointer];

    if (!head) {
      return;
    }

    this.pointer--;

    this.reka.change(
      () => {
        [...head.changes].reverse().map((change) => {
          this.applyInverse(change);
        });
      },
      {
        silent: true,
      }
    );
  }

  redo() {
    if (this.pointer >= this.stack.length) {
      return;
    }

    const next = this.stack[++this.pointer];

    if (!next) {
      return;
    }

    this.reka.change(
      () => {
        next.changes.map((change) => {
          this.apply(change);
        });
      },
      {
        silent: true,
      }
    );
  }

  canUndo() {
    return this.stack.length > 0 && this.pointer >= 0;
  }

  canRedo() {
    return this.stack.length > 0 && this.pointer < this.stack.length - 1;
  }
}
