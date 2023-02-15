export type WriterResult = Array<string | WriterResult>;

export class Writer {
  base: string;
  indent: string;

  result: WriterResult = [];

  constructor() {
    this.base = '';
    this.indent = '    ';
  }

  static block(cb: (writer: Writer) => void) {
    const writer = new Writer();
    cb(writer);
    return writer.toString();
  }

  static mergeConsecutiveStrings(arr: WriterResult) {
    if (arr.length === 1) {
      return arr;
    }

    for (let i = arr.length - 1; i > 0; i--) {
      const current = arr[i];

      if (typeof current !== 'string') {
        continue;
      }

      if (current === '\n') {
        continue;
      }

      const prev = arr[i - 1];

      if (typeof prev !== 'string') {
        continue;
      }

      if (prev === '\n') {
        continue;
      }

      arr[i - 1] += current;
      arr.length--;
    }

    return arr;
  }

  static join(left: WriterResult, right: WriterResult) {
    if (left.length === 0) {
      return right;
    }

    if (right.length === 0) {
      return left;
    }

    return Writer.mergeConsecutiveStrings([...left, ' ', ...right]);
  }

  newline() {
    this.result.push('\n');
  }

  write(str: string | Array<string> | WriterResult) {
    if (Array.isArray(str)) {
      this.result.push(...str);
      Writer.mergeConsecutiveStrings(this.result);
      return;
    }

    if (
      typeof this.result[this.result.length - 1] === 'string' &&
      this.result[this.result.length - 1] !== '\n' &&
      str !== '\n'
    ) {
      this.result[this.result.length - 1] += str;
      return;
    }

    this.result.push(str);
  }

  withIndent(
    cb: () => void,
    condition?: { test: () => boolean; wrap?: (cb: () => void) => void }
  ) {
    if (condition && !condition.test()) {
      if (condition.wrap) {
        condition.wrap(cb);
        return;
      }

      cb();

      return;
    }

    const prev = this.result;
    this.result = [];
    cb();
    if (this.result.length > 0) {
      prev.push(this.result);
    }
    this.result = prev;
  }

  withTemp(cb: () => void) {
    const prev = this.result;
    const temp: WriterResult = [];
    this.result = temp;
    cb();
    this.result = prev;
    return temp;
  }

  line(cb: () => void) {
    this.write('\n');
    cb();
    this.write('\n');
  }

  toString() {
    let depth = 0;
    let str = ``;

    const _toString = (arr: WriterResult) => {
      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];

        if (Array.isArray(c)) {
          const prev = depth;
          depth = depth + 1;
          str += '\n';
          _toString(c);
          str += '\n';
          depth = prev;
          continue;
        }

        if (c === '\n') {
          str += '\n';
          continue;
        }

        if (depth > 0) {
          for (let j = 0; j < depth; j++) {
            str += ' ';
          }
        }

        str += c;
      }

      depth -= 1;
    };

    _toString(this.result);

    return str;
  }
}
