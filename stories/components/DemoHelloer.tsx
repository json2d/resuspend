import React, { Suspense } from 'react';
import {
  ControlledHelloerProps,
  ControlledSuspendableHelloer,
} from '../../test/fixtures/Helloer';
import SuspensionAlert from './SuspensionAlert';

export default (props: ControlledHelloerProps) => (
  <Suspense fallback={<SuspensionAlert />}>
    <ControlledSuspendableHelloer {...props} />
  </Suspense>
);
