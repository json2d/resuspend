import React, { useCallback, useState } from 'react';
import { Suspension } from '../../src';

/**
 * this React component waits for some amount of time specified by its `duration` prop before finally rendering its `children` prop
 * @component
 * @example
 * const waitDuration = 1000 // 1 second in ms
 * return (
 *   <Suspense fallback={<>[pausing dramatically...]</>}/>
 *     <DramaticPause duration={waitDuration}/>
 *   </Suspense>
 * )
 */
export default function DramaticPause(props: {
  duration?: number;
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState(!props.duration);

  const waitAndThenShow = useCallback(() => {
    const timeoutId = setTimeout(() => setShow(true), props.duration);
    return () => clearTimeout(timeoutId);
  }, [setShow, props.duration]);

  const hide = useCallback(() => setShow(false), [setShow]);

  return (
    <Suspension active={!show} onActive={waitAndThenShow}>
      {props.children}
      <button onClick={hide}>
        <pre>refresh</pre>
      </button>
    </Suspension>
  );
}
