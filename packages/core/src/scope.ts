export class Scope {
  private variableNames: Set<string>;

  constructor(readonly key: string, readonly parent?: Scope) {
    this.variableNames = new Set();
  }

  inherit(key: string) {
    return new Scope(key, this);
  }

  defineVariableName(name: string) {
    this.variableNames.add(name);
  }

  removeVariableName(name: string) {
    this.variableNames.delete(name);
  }

  clear() {
    this.variableNames.clear();
  }

  getDistance(name: string) {
    let distance = 0;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let scope: Scope = this;

    do {
      if (scope.variableNames.has(name)) {
        return distance;
      }
    } while (scope.parent && (scope = scope.parent) && (distance += 1));

    return -1;
  }

  has(name: string) {
    return this.variableNames.has(name);
  }

  forEach(cb: (name: string) => void) {
    for (const name of this.variableNames) {
      cb(name);
    }
  }

  toString() {
    const keyToId: string[] = [];

    for (const key of this.variableNames) {
      keyToId.push(`${key}`);
    }

    let key = keyToId.join(`,`);

    if (this.parent) {
      key = this.parent.toString() + ',' + key;
    }

    return key;
  }
}
