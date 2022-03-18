import React from 'react';
import { DestructorRef, Condition } from './types';
import { useSuspension } from './useSuspension';
import { withProxiedCleanup } from './withProxiedCleanup';
/**
 * this React component utilizes the `useSuspension` hook, which should be configured w/ a proxied cleanup via a forwarded ref
 * w/o a proxied cleanup there will be a potential for a memory leak within certain distinct scenarios
 * @component
 */
const SuspensionWithoutProxiedCleanup = (props: {
  active: Condition;
  onActive?: React.EffectCallback;
  children?: React.ReactNode;
  proxiedCleanupRef: DestructorRef;
}) => {
  useSuspension(props.active, [props.proxiedCleanupRef, props.onActive]);
  return <>{props.children}</>;
};

/**
 * this React component is designed to work together w/ the [`<Suspense/>` component from the React API](https://reactjs.org/docs/concurrent-mode-suspense.html)
 * in order to facilitate whatever **suspension logic** you may wish to implement in your [React](https://reactjs.org/) app,
 * with an initial focus on *content fulfillment* and *user experience pacing* as the primary use cases
 *
 * @component
 *
 * Example:
 *
 * - [basic example](https://github.com/json2d/resuspend/blob/main/packages/resuspend#basic-example)
 * - [data fetching example](https://github.com/json2d/resuspend/blob/main/packages/resuspend#data-fetching-example)
 *
 * API:
 *
 * - [`<Suspension/>` props reference](https://github.com/json2d/resuspend/blob/main/packages/resuspend#props-reference)
 */
export const Suspension = withProxiedCleanup(SuspensionWithoutProxiedCleanup);
