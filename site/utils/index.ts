import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

export * from './collaboration';

export const isPrimitiveValue = (value: any) => {
  return value === null || typeof value !== 'object';
};

export const generateRandomName = () =>
  uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: ' ',
    style: 'capital',
  });

type AnimationSequence = [() => void, number?];

export const requestAnimationSequence = (sequences: AnimationSequence[]) => {
  let current = sequences.shift();
  let prevTimestamp = 0;

  const animate = (timestamp: number) => {
    if (!current) {
      return;
    }

    const [fn, delay] = current;

    if (!prevTimestamp) {
      prevTimestamp = timestamp;
    }
    if (!delay || timestamp - prevTimestamp >= delay) {
      fn();
      prevTimestamp = timestamp;
      current = sequences.shift();
    }

    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
};
