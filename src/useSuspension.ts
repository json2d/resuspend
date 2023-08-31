import { useRef } from 'react';
import { Maybe } from './types';

// prefix used to decorate logs useful for debugging the lifecycle of `SuspensionController` objects
const LOW_TAG = '🌊';

// prefix used to decorate logs useful for debugging the lifecycle of `useSuspension` hooks (which use `SuspensionController` objects internally)
const HIGH_TAG = '🏄🏽';

export interface SuspensionController {
  _suspension: {
    _running: Maybe<Promise<void>>;
    _resolve: Maybe<() => void>;
  };
  _suspend: () => void;
  _unsuspend: () => void;
}

/**
 * this hook controls the activation status of a suspension
 * for testing purposes, it returns an object that is used internally to monitor and control a suspension
 * @param active the activation status
 * @returns
 */
export function useSuspension(active: boolean): SuspensionController {
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
    _suspend: () => {
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
    _unsuspend: () => {
      console.debug(LOW_TAG, 'unsuspending...');
      // @ts-ignore: errors w/ `Maybe` types x optional chaining
      controller.current._suspension._resolve?.(); // this helps the callback be more idempotent
      controller.current._suspension._running = null;
      controller.current._suspension._resolve = null;
    },
  });

  console.debug(
    HIGH_TAG,
    'monitoring activation status and managing suspension lifecycle'
  );

  if (active) {
    console.debug(
      HIGH_TAG,
      'activation status is now active, suspension activating...'
    );

    controller.current._suspend(); // throws
  } else {
    console.debug(
      HIGH_TAG,
      'activation status is now inactive, suspension deactivating...'
    );
    controller.current._unsuspend();
  }

  // report controller values
  return controller.current;
}
