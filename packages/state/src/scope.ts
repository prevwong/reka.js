export class Scope {
  private variableNames: Set<string>;

  constructor(readonly key: string, readonly parent?: Scope) {
    this.variableNames = new Set();
  }

  defineVariableName(name: string) {
    this.variableNames.add(name);
  }

  getDistance(name: string) {
    let distance = 0;
    let scope: Scope = this;

    do {
      if (scope.variableNames.has(name)) {
        return distance;
      }
    } while (scope.parent && (scope = scope.parent) && (distance += 1));

    return -1;
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
