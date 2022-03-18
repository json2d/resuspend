import React, { useEffect, useRef } from 'react';
import { Maybe, Destructor, DestructorRef } from './types';
/**
 * this React component proxies cleanup on unmount for some descendent component via ref forwarded as render prop
 * @param props
 * @returns
 */
export const CleanupProxy = (props: {
  // render prop
  children: (proxiedCleanupRef: DestructorRef) => React.ReactNode;
}) => {
  const proxiedCleanupRef = useRef<Maybe<Destructor>>();

  // run cleanup on unmount for descendent component
  // @ts-ignore: errors w/ `Maybe` types x optional chaining
  useEffect(() => () => void proxiedCleanupRef.current?.(), []);

  // use render prop to pass `proxiedCleanupRef` forward to descendent component
  return <>{props.children(proxiedCleanupRef)}</>;
};
