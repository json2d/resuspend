import { renderHook } from '@testing-library/react-hooks';
import { useSuspension } from '../src';

test('should not suspend (initial)', () => {
  const { result } = renderHook(() => useSuspension(false));

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);
});

test('should not suspend (initial), then suspend, then unsuspend, then suspend, then unsuspend', () => {
  // not suspend (initial)
  let isSuspended = false;
  const { result, rerender } = renderHook(() => useSuspension(isSuspended));

  const spySuspend = jest.spyOn(result.current, '_suspend');
  const spyUnsuspend = jest.spyOn(result.current, '_unsuspend');

  // suspend
  isSuspended = true;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(1);
  expect(spyUnsuspend).toHaveBeenCalledTimes(0);

  expect(result.current._suspension._running).toBeInstanceOf(Promise);
  expect(typeof result.current._suspension._resolve).toBe('function');

  // @ts-ignore
  const spyResolve = jest.spyOn(result.current._suspension, '_resolve'); // one-off

  // unsuspend
  isSuspended = false;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(1);
  expect(spyUnsuspend).toHaveBeenCalledTimes(1);

  expect(spyResolve).toHaveBeenCalled();

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);

  // suspend
  isSuspended = true;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(2);
  expect(spyUnsuspend).toHaveBeenCalledTimes(1);

  expect(result.current._suspension._running).toBeInstanceOf(Promise);
  expect(typeof result.current._suspension._resolve).toBe('function');

  // @ts-ignore
  const spyResolve2 = jest.spyOn(result.current._suspension, '_resolve'); // one-off #2

  // unsuspend
  isSuspended = false;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(2);
  expect(spyUnsuspend).toHaveBeenCalledTimes(2);

  expect(spyResolve2).toHaveBeenCalled();

  expect(result.current._suspension._running).toBe(null);
});

test('should suspend (initial)', () => {
  const { result } = renderHook(() => useSuspension(true));

  // 👀(empty-result-on-immediate-suspend)
  // result will be not be set because the initial render of the hooks going to immediately suspend and throw before returning anything
  expect(result.current).toBe(undefined);
});

test('should suspend (initial), then unsuspend, then suspend, then unsuspend', () => {
  // suspend (initial)
  let isSuspended = true;
  const { result, rerender } = renderHook(() => useSuspension(isSuspended));

  // unsuspend
  isSuspended = false;
  rerender();

  const spySuspend = jest.spyOn(result.current, '_suspend');
  const spyUnsuspend = jest.spyOn(result.current, '_unsuspend');

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);

  // suspend
  isSuspended = true;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(1);
  expect(spyUnsuspend).toHaveBeenCalledTimes(0);

  expect(result.current._suspension._running).toBeInstanceOf(Promise);
  expect(typeof result.current._suspension._resolve).toBe('function');

  // @ts-ignore
  const spyResolve = jest.spyOn(result.current._suspension, '_resolve'); // one-off

  // unsuspend
  isSuspended = false;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(1);
  expect(spyUnsuspend).toHaveBeenCalledTimes(1);

  expect(spyResolve).toHaveBeenCalled();

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);
});

test('should not suspend (initial), then suspend, then resuspend (idempotent), then unsuspend, then re-unsuspend (idempotent)', () => {
  // not suspend (initial)
  let isSuspended = false;
  const { result, rerender } = renderHook(() => useSuspension(isSuspended));

  const spySuspend = jest.spyOn(result.current, '_suspend');
  const spyUnsuspend = jest.spyOn(result.current, '_unsuspend');

  // suspend
  isSuspended = true;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(1);
  expect(spyUnsuspend).toHaveBeenCalledTimes(0);

  const prevRunning = result.current._suspension._running;
  const prevResolve = result.current._suspension._resolve;

  // resuspend (idempotent)
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(2);
  expect(spyUnsuspend).toHaveBeenCalledTimes(0);

  expect(result.current._suspension._running).toStrictEqual(prevRunning);
  expect(result.current._suspension._resolve).toStrictEqual(prevResolve);

  // unsuspend
  isSuspended = false;
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(2);
  expect(spyUnsuspend).toHaveBeenCalledTimes(1);

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);

  // unsuspend (idempotent)
  rerender();

  expect(spySuspend).toHaveBeenCalledTimes(2);
  expect(spyUnsuspend).toHaveBeenCalledTimes(2);

  expect(result.current._suspension._running).toBe(null);
  expect(result.current._suspension._resolve).toBe(null);
});
