import React, { Suspense, useEffect, useState } from 'react';
import DramaticPause from './DramaticPause';
import ComplementaryNote from './ComplementaryNote';
import { Suspension } from '../../src/Suspension';

export interface UncontrolledHelloerProps {
  name: string;
}

export const UncontrolledHelloer = (props: UncontrolledHelloerProps) => (
  <pre role="heading">hello {props.name}!</pre>
);

export interface DramaticHelloerProps {
  name: string;
  tagline?: string;
  pauseDuration?: number;
}

export const DramaticHelloer = (props: DramaticHelloerProps) => {
  return (
    <Suspense
      fallback={<pre role="alert">[pausing for dramatic effect...]</pre>}
    >
      <DramaticPause duration={props.pauseDuration}>
        <UncontrolledHelloer name={props.name} />
        <ComplementaryNote />
      </DramaticPause>
    </Suspense>
  );
};


export const UnboundDramaticHelloer = () => {
  const [revealed, setRevealed] = useState(false);

  // hide and show greeting repeatedly (w/ some pacing)
  useEffect(() => {
    let timeoutId;
    if (!revealed) setTimeout(() => setRevealed(true), 3000);
    else setTimeout(() => setRevealed(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [revealed]);


  return (
    <Suspension active={!revealed}>
      <h1>hello world! 👋🏽🌎</h1>
    </Suspension>
  );
};
