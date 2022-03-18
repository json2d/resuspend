import { renderHook } from '@testing-library/react-hooks/dom';
import { useIsInitialRender } from '../src';

describe('when initial render', () => {
  test('should return true', () => {
    const { result } = renderHook(() => useIsInitialRender());

    expect(result.current).toBe(true);
  });
});

describe('when update render', () => {
  test('should return false', () => {
    const { result, rerender } = renderHook(() => useIsInitialRender());

    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(false);

    rerender();

    expect(result.current).toBe(false);
  });
});
