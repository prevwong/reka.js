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

  applyUndo(change: OnChangePayload) {
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

  applyRedo(change: OnChangePayload) {
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

  /**
   * Apply a changeset via undo/redo with the ability to abort in case an error occurs
   */
  private changeWithRollback(pointer: number, direction: 'undo' | 'redo') {
    const changeset = this.stack[pointer];

    this.reka.change(
      () => {
        let abortIdx = -1;
        let changes = changeset.changes;

        if (direction === 'undo') {
          changes = [...changes].reverse();
        }

        for (let i = 0; i < changes.length; i++) {
          try {
            if (direction === 'undo') {
              this.applyUndo(changes[i]);
            } else {
              this.applyRedo(changes[i]);
            }
          } catch {
            abortIdx = i;
            break;
          }
        }

        /**
         * If any errors occurs while applying a changeset, we need to abort and reverse the changes that were applied
         * This typically can happen when in a collaborative environment.
         *
         * For example, 2 users editing the same document:
         * User A makes some changes to a Button
         * User B then deletes the Button
         *
         * If User A tries to undo, the changeset will contain the inverse changes to the Button (which is now deleted),
         * in which case, the changeset will contain changes to an invalid path (the Button) that no longer exists,
         * hence an error will occur when we try to perform an undo.
         *
         * Therefore, the simplest way to go about this is to simply abort the undo,
         * reverse any changes that were already applied while performing the undo operation.
         */
        if (abortIdx >= 0) {
          // Rollback changes that were already applied (if any)
          for (let i = abortIdx - 1; i >= 0; i--) {
            if (direction === 'undo') {
              this.applyRedo(changes[i]);
            } else {
              this.applyUndo(changes[i]);
            }
          }

          /**
           * Remove the current changeset where the error happened, from the history stack.
           * Making it no longer possible to undo/redo the current changeset.
           */
          this.stack.splice(pointer, 1);

          /**
           * Try to perform the next undo/redo in the stack, if possible.
           */
          if (direction === 'undo') {
            this.undo();
            return;
          }

          this.redo();
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

    this.changeWithRollback(currentPointer, 'undo');

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

    this.changeWithRollback(this.pointer, 'redo');

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
