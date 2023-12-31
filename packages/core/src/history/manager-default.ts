import { HistoryManager } from './manager';

import { OnChangePayload, Path } from '../observer';

type HistoryChangeset = {
  timestamp: number;
  changes: OnChangePayload[];
};

export class DefaultHistoryManager extends HistoryManager {
  private stack: HistoryChangeset[] = [];
  private pointer = -1;

  declare disposeListener: () => void;

  init() {
    this.disposeListener = this.reka.listenToChangeset((payload) => {
      if (payload.source === 'history' || payload.info.history.ignore) {
        return;
      }

      if (payload.changes.length <= 0) {
        return;
      }

      const now = Date.now();

      const prev = this.stack[this.pointer];

      const throttleThreshold = payload.info.history.throttle;

      if (
        throttleThreshold &&
        prev &&
        Math.abs(now - prev.timestamp) <= throttleThreshold
      ) {
        this.stack[this.pointer] = {
          timestamp: prev.timestamp,
          changes: [...prev.changes, ...payload.changes],
        };
      } else {
        this.pointer++;
        this.stack[this.pointer] = {
          timestamp: now,
          changes: payload.changes,
        };

        this.stack.length = this.pointer + 1;
      }

      this.syncStatus();
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

      if (value === undefined) {
        throw new Error(`Cannot resolve path`);
      }

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

  private changeWithRollback(
    pointer: number,
    direction: 'backward' | 'forward'
  ) {
    const changeset = this.stack[pointer];

    this.reka.change(
      () => {
        let abortIdx = -1;
        let changes = changeset.changes;

        if (direction === 'backward') {
          changes = [...changes].reverse();
        }

        for (let i = 0; i < changes.length; i++) {
          try {
            if (direction === 'backward') {
              this.applyInverse(changes[i]);
            } else {
              this.apply(changes[i]);
            }
          } catch {
            abortIdx = i;
            break;
          }
        }

        if (abortIdx >= 0) {
          // Rollback all changes
          for (let i = abortIdx - 1; i >= 0; i--) {
            if (direction === 'backward') {
              this.apply(changes[i]);
            } else {
              this.applyInverse(changes[i]);
            }
          }

          // remove from history, can't do anything with it anymore
          this.stack.splice(pointer, 1);
          this.undo();
        }
      },
      {
        source: 'history',
      }
    );
  }

  undo() {
    if (this.pointer < 0) {
      return;
    }

    const currentPointer = this.pointer;

    const head = this.stack[currentPointer];

    if (!head) {
      return;
    }

    this.pointer--;

    this.changeWithRollback(currentPointer, 'backward');

    this.syncStatus();
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
        source: 'history',
      }
    );

    this.syncStatus();
  }

  private syncStatus() {
    this.setStatus((status) => {
      status.undoable = this.stack.length > 0 && this.pointer >= 0;
      status.redoable =
        this.stack.length > 0 && this.pointer < this.stack.length - 1;
    });
  }
}
