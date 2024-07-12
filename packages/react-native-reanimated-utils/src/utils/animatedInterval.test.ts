import { clearAnimatedInterval, setAnimatedInterval } from './animatedInterval';

describe(setAnimatedInterval, () => {
  it('returns a numeric interval id greater than or equal to 0', () => {
    const interval = setAnimatedInterval(jest.fn(), 0);

    expect(typeof interval).toBe('number');
    expect(interval).toBeGreaterThanOrEqual(0);
  });

  it('returns unique interval ids for different intervals', () => {
    const interval1 = setAnimatedInterval(jest.fn(), 0);
    const interval2 = setAnimatedInterval(jest.fn(), 0);

    expect(interval1).not.toBe(interval2);
    expect(interval1).toBeLessThan(interval2);
  });

  it('executes the callback with the given interval', () => {
    const callback = jest.fn();
    const interval = 1000;

    setAnimatedInterval(callback, interval);

    expect(callback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('starts multiple intervals when called multiple times', () => {
    const callback = jest.fn();
    const interval = 1000;

    setAnimatedInterval(callback, interval);
    setAnimatedInterval(callback, interval);

    expect(callback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(4);
  });

  it('executes different callbacks with different intervals', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const interval1 = 1000;
    const interval2 = 2000;

    setAnimatedInterval(callback1, interval1);
    setAnimatedInterval(callback2, interval2);

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(3);
    expect(callback2).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(4);
    expect(callback2).toHaveBeenCalledTimes(2);
  });
});

describe(clearAnimatedInterval, () => {
  it('cancels the interval', () => {
    const callback = jest.fn();
    const interval = 1000;

    const intervalObject = setAnimatedInterval(callback, interval);
    clearAnimatedInterval(intervalObject);

    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('cancels only the specified interval', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const interval = 1000;

    const interval1 = setAnimatedInterval(callback1, interval);
    setAnimatedInterval(callback2, interval);

    clearAnimatedInterval(interval1);

    jest.advanceTimersByTime(interval);
    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
