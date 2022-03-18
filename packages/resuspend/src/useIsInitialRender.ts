import { useRef } from 'react';
/**
 * this hook tells you whether or not a component is currently rendering but not yet mounted, i.e. while the component is still in an ephemeral state.
 * adapted from the `useIsFirstRender` hook from `usehooks-ts` package
 * @returns
 */
export function useIsInitialRender(): boolean {
  const isInitial = useRef(true);

  if (isInitial.current) {
    isInitial.current = false;

    return true;
  } else {
    return false;
  }
}
