import React, { useCallback, useEffect, useRef } from 'react';
import { useIsInitialRender } from './useIsInitialRender';
import {
  Maybe,
  DestructorRef,
  Destructor,
  ImmediateEffectCallback,
  DestructorRegistrator,
} from './types';

interface EffectController {
  _prevDeps?: React.DependencyList;
  _cleanup?: Maybe<Destructor>;
  _registerCleanup: DestructorRegistrator;
}
/**
 * this hook has the same signature as `useEffect` and `useLayoutEffect` but executes the effect immediately instead of after rendering
 * this is the recommended way to write our suspension management logic with callbacks from `useSuspension` because interrupting/suspending render is usually the desired behavior
 * that is to say that the implied high-level use of `useSuspension` with `Suspense` is as a safeguard when something needed for a component to render successfully is missing and needs to be fetched, computed, etc.
 * this hook also will have some apparent "dogfooding" in its design to make useful for implementing the `useSuspension` hook
 * @param effect the effect callback
 * @param deps the dependencies
 * @returns the controller object for debug
 */
export const useImmediateEffect = (
  effect:
    | ImmediateEffectCallback
    | [Maybe<DestructorRef>, ImmediateEffectCallback], // cleanup dependency injection
  deps?: React.DependencyList
): EffectController => {
  // resolve fuzzy `effect` type w/ cleanup dependency injection
  let proxiedCleanupRef: Maybe<DestructorRef>;
  let resolvedEffect: ImmediateEffectCallback;

  if (Array.isArray(effect)) {
    [proxiedCleanupRef, resolvedEffect] = effect;
  } else {
    resolvedEffect = effect;
  }

  const isInitialRender = useIsInitialRender();

  // in order to have a `useCallback` hook keep `registerCleanup` in controller ref up-to-date it needs to be `undefined` for a step
  let _registerCleanup!: (cleanup: Maybe<Destructor>) => void;

  // the above `!` post-fix expression asserts that `registerCleanup` will not be `undefined`
  // and this satisfies the `registerCleanup` type check in controller ref initial value
  const controller = useRef<EffectController>({ _registerCleanup });

  // finally `registerCleanup` is assigned w/ `useCallback` and no longer `undefined` (as promised to the compiler)
  controller.current._registerCleanup = useCallback(
    (_cleanup: Maybe<Destructor>) => {
      setTimeout(() => {
        if (isInitialRender) {
          if (proxiedCleanupRef) {
            proxiedCleanupRef.current = _cleanup;
          } else {
            // here's a chance to educate users about how to safely consume this hook
            console.warn(
              'potenital memory leak w/ `useImmediateEffect` hook if `effect` throws on initial render. you probably need to use `CleanupProxy`'
            );
            controller.current._cleanup = _cleanup; // won't work on suspend as all refs are ephemeral here
          }
        } else {
          controller.current._cleanup = _cleanup;
        }
      });
    },
    [proxiedCleanupRef]
  );

  // do effect if:
  // - initial render
  // - no deps
  // - any deps changed since last call

  if (isInitialRender) {
    controller.current._prevDeps = deps;

    // due to how React works when `effect` throws on initial render, we need a novel strategy do the `effect` cleanup
    // specifically we'll utilize a forwarded ref from the parent component the get it done as expected
    // the idea is that at this point here it's safe to assume the parent component node is mounted
    // and therefore it's forwarded refs are stable enough to persist the `effect` cleanup through the throw event
    // whereas a local ref (one declared in this hook or in component using) would be too ephemeral for that purpose
    // in other words: local refs don't 'survive' when `effect` throws on initial render
    // to be sure, not even the component will `survive` when anything throws on initial render

    // do `effect` cleanup from previous inital render where `effect` threw then and then again on an initial render retry
    // note: this can illustrate how forwarded refs do 'survive' when initial render suspends

    // @ts-ignore: errors w/ `Maybe` types x optional chaining
    if (proxiedCleanupRef?.current) {
      proxiedCleanupRef.current();
      proxiedCleanupRef.current = null;
    }

    const _cleanup = resolvedEffect(controller.current._registerCleanup);

    if (proxiedCleanupRef) {
      proxiedCleanupRef.current = _cleanup;
    } else {
      console.warn(
        'potenital memory leak w/ `useImmediateEffect` hook if `effect` throws on initial render. you probably need to use `CleanupProxy`'
      );
      controller.current._cleanup = _cleanup;
    }
  } else {
    if (
      !deps ||
      (deps.length > 0 &&
        !deps.every((dep, i) => dep === controller.current._prevDeps?.[i]))
    ) {
      controller.current._prevDeps = deps;

      // @ts-ignore: errors w/ `Maybe` types x optional chaining
      if (proxiedCleanupRef?.current) {
        proxiedCleanupRef.current();
        proxiedCleanupRef.current = null;
      } else {
        // @ts-ignore: errors w/ `Maybe` types x optional chaining
        controller.current._cleanup?.();
        controller.current._cleanup = null;
      }

      const _cleanup = resolvedEffect(controller.current._registerCleanup);
      controller.current._cleanup = _cleanup;
    }
  }

  // on unmount, cleanup maybe
  // @ts-ignore: errors w/ `Maybe` types x optional chaining
  useEffect(() => () => controller.current._cleanup?.(), []);

  return controller.current;
};
