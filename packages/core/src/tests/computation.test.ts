import { invariant } from '@rekajs/utils';
import { observable, getObserverTree, onBecomeObserved } from 'mobx';

import { DisposableComputation } from '../computation';

const fn = vi.fn();

const o = observable.box(1);

let computation: DisposableComputation<void>;

describe('Computation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    computation = new DisposableComputation(
      () => {
        fn(o.get());
      },
      {
        keepAlive: true,
        name: 'test',
      }
    );
  });
  afterEach(() => {
    computation.dispose();
  });
  it('should only start observing after initial .get() is called', async () => {
    const callback = vi.fn();
    onBecomeObserved(o, callback);

    expect(callback).not.toHaveBeenCalled();
    computation.get();
    expect(fn).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });
  it('should only re-evaluate when observable has changed and .get() is called', () => {
    o.set(3);
    expect(fn).not.toHaveBeenCalled();
    computation.get();
    computation.get();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe('on dispose', () => {
    it('should unobserve observable when .dispose() is called', () => {
      computation.get();

      const observer = getObserverTree(o).observers?.[0];

      invariant(observer, 'Observer not found');

      expect(observer.name).toEqual('Computation<test>');

      computation.dispose();

      expect(getObserverTree(o).observers).toBeUndefined();
    });
    it('should behave as standard non-cached function after .dispose() is called', () => {
      computation.dispose();

      computation.get();
      computation.get();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
