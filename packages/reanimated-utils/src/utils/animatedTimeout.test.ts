import { clearAnimatedTimeout, setAnimatedTimeout } from './animatedTimeout';

describe(setAnimatedTimeout, () => {
  it('returns a numeric timeout id greater than or equal to 0', () => {
    const timeout = setAnimatedTimeout(jest.fn(), 0);

    expect(typeof timeout).toBe('number');
    expect(timeout).toBeGreaterThanOrEqual(0);
  });

  it('returns unique timeout ids for different timeouts', () => {
    const timeout1 = setAnimatedTimeout(jest.fn(), 0);
    const timeout2 = setAnimatedTimeout(jest.fn(), 0);

    expect(timeout1).not.toBe(timeout2);
    expect(timeout1).toBeLessThan(timeout2);
  });

  it('executes the callback after the delay', () => {
    const callback = jest.fn();
    const delay = 1000;

    setAnimatedTimeout(callback, delay);

    expect(callback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(delay);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('executes timeout multiple times when called multiple times', () => {
    const callback = jest.fn();
    const delay = 1000;

    setAnimatedTimeout(callback, delay);
    setAnimatedTimeout(callback, delay);

    expect(callback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(delay);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('executes different callbacks with different delays', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const delay1 = 1000;
    const delay2 = 2000;

    setAnimatedTimeout(callback1, delay1);
    setAnimatedTimeout(callback2, delay2);

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

describe(clearAnimatedTimeout, () => {
  it('cancels the timeout', () => {
    const callback = jest.fn();
    const delay = 1000;

    const timeout = setAnimatedTimeout(callback, delay);
    clearAnimatedTimeout(timeout);

    jest.advanceTimersByTime(delay);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('cancels only specified timeout', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const delay = 1000;

    const timeout1 = setAnimatedTimeout(callback1, delay);
    setAnimatedTimeout(callback2, delay);

    clearAnimatedTimeout(timeout1);

    jest.advanceTimersByTime(delay);
    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
