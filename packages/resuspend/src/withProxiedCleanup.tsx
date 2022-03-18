import React from 'react';
import { DestructorRef } from './types';
import { CleanupProxy } from './CleanupProxy';
export interface WithProxiedCleanupProps {
  proxiedCleanupRef: DestructorRef;
}

/**
 * this higher order component wraps another target component w/ a `CleanupProxy` component,
 * forwarding it's proxied cleanup ref to the target component's `proxiedCleanupRef` prop
 * @param WrappedComponent
 * @returns
 */
// following cheatsheet https://react-typescript-cheatsheet.netlify.app/docs/hoc/full_example
export function withProxiedCleanup<
  P extends WithProxiedCleanupProps = WithProxiedCleanupProps
>(WrappedComponent: React.ComponentType<P>) {
  const WithProxiedCleanup = (
    props: Omit<P, keyof WithProxiedCleanupProps>
  ) => (
    <CleanupProxy>
      {(proxiedCleanupRef) => (
        <WrappedComponent
          {...(props as P)}
          proxiedCleanupRef={proxiedCleanupRef} // prop injection
        />
      )}
    </CleanupProxy>
  );

  // set the default HOC'd component name in dev tools as per convention
  // https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
  WithProxiedCleanup.displayName = `WithCleanupProxy(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithProxiedCleanup;
}
