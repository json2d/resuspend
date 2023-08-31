import React from 'react';
import { SuspensionController, useSuspension } from './useSuspension';
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
export const Suspension = (props: {
  active?: boolean;
  children?: React.ReactNode | ((controller: SuspensionController) => React.ReactNode);
}) => {
  const controller = useSuspension(props.active ?? false);
  return <>{typeof props.children === 'function' ? props.children(controller) : props.children}</>;
};
