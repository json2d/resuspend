import { useEffect, useRef } from 'react';
import { useImmediateEffect } from './useImmediateEffect';
import {
  DestructorRef,
  Condition,
  Maybe,
  DestructorRegistrator,
} from './types';

// prefix used to decorate logs useful for debugging the lifecycle of `SuspensionController` objects
const LOW_TAG = '🌊';

// prefix used to decorate logs useful for debugging the lifecycle of `useSuspension` hooks, which use `SuspensionController` objects internally
const HIGH_TAG = '🏄🏽‍♂️';

interface SuspensionController {
  _suspension: {
    _running: Maybe<Promise<void>>;
    _resolve: Maybe<() => void>;
  };
  suspend: () => void;
  unsuspend: () => void;
}

/**
 * this hook returns an object that can functionally control a suspension
 * it's not so end-user-friendly, but will be useful as a building block for better hooks w/ more domain specific suspension handling
 * @param active the activation status
 * @param onActive the activation effect
 * @returns
 */
export function useSuspension(
  active?: Condition,
  onActive?:
    | React.EffectCallback
    | [Maybe<DestructorRef>, Maybe<React.EffectCallback>]
): SuspensionController {
  const controller = useRef<SuspensionController>({
    // internals
    _suspension: {
      // promise for this suspension that gets thrown and caught by nearest ancestor `Suspense` component
      _running: null,
      // callback that resolves the promise for this suspension
      _resolve: null,
    },
    // callback that transitions activation status to active
    // 👀 idempotent
    suspend: () => {
      console.debug(LOW_TAG, 'suspending...');

      if (controller.current._suspension._running) {
        // re-throw promise for this suspension if already active
        throw controller.current._suspension._running;
      } else {
        console.debug(LOW_TAG, 'creating suspension promise');
        controller.current._suspension._running = new Promise((resolve) => {
          // save the callback that resolves the promise for this suspension - will be called later
          // 👀 this is the mechanism that signals the `Suspense` boundary to try rendering again
          console.debug(
            LOW_TAG,
            'linking suspension promise resolver callback'
          );
          controller.current._suspension._resolve = resolve;
        });

        console.debug(LOW_TAG, 'throwing suspension promise');
        throw controller.current._suspension._running;
      }
    },
    // callback that transitions activation status to inactive
    // 👀 idempotent
    unsuspend: () => {
      console.debug(LOW_TAG, 'unsuspending...');
      // @ts-ignore: errors w/ `Maybe` types x optional chaining
      controller.current._suspension._resolve?.(); // this helps the callback be more idempotent
      controller.current._suspension._running = null;
    },
  });

  // on unmount, cleanup if activation status to active
  useEffect(
    () => () => {
      // @ts-ignore: errors w/ `Maybe` types x optional chaining
      controller.current._suspension._resolve?.();
    },
    []
  );

  // resolve fuzzy activation effect w/ cleanup dependency injection (same as w/ `useImmediateEffect` hook)
  let proxiedCleanupRef: Maybe<DestructorRef>;
  let onActiveResolved: Maybe<React.EffectCallback>;
  if (onActive) {
    if (Array.isArray(onActive)) {
      [proxiedCleanupRef, onActiveResolved] = onActive;
    } else {
      onActiveResolved = onActive;
    }
  }

  // fuzzy type: boolean or function returning a boolean w/ no side-effects
  const activeResolved =
    (active instanceof Function && active()) ||
    (!(active instanceof Function) && active);

  function manageSuspension(registerCleanup: DestructorRegistrator) {
    console.debug(
      HIGH_TAG,
      'monitoring activation status and managing suspension lifecycle'
    );

    if (active) {
      console.debug(
        HIGH_TAG,
        'activation status is now active, suspension activating...'
      );

      if (onActiveResolved) {
        // defer `onActive` so it is called after `suspend` is called
        setTimeout(() => {
          console.debug(HIGH_TAG, 'activation effect running...');
          // @ts-ignore: errors w/ `Maybe` types x optional chaining
          const _cleanup = onActiveResolved?.();
          registerCleanup(_cleanup); // manage side-effects
        });
      }
      controller.current.suspend(); // throws
    } else {
      console.debug(
        HIGH_TAG,
        'activation status is now inactive, suspension deactivating...'
      );
      controller.current.unsuspend();
    }
  }

  // TODO: explain why you should use `activeResolved` but not `onActiveResolved` as dep here
  useImmediateEffect(
    [proxiedCleanupRef, manageSuspension],
    [activeResolved, onActive]
  );

  // report controller values
  return controller.current;
}
