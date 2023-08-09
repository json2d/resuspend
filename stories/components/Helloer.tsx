import React, { Suspense } from 'react';
import DramaticPause from './DramaticPause';
import ComplementaryNote from './ComplementaryNote';

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
