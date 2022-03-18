import React, { useCallback, useEffect, useState } from 'react';
import { Suspension, useSuspension, withProxiedCleanup } from '../../src';
import { WithProxiedCleanupProps } from '../../src/withProxiedCleanup';

export const mockSuspensionEffect = jest.fn();
export const mockSuspensionCleanup = jest.fn();

export const mockContentRender = jest.fn();
export const mockContentCleanup = jest.fn();

export interface UncontrolledHelloerProps {
  name?: string;
  onName404?: React.EffectCallback;
}

export interface ControlledHelloerProps {
  initialName?: string;
  constructive?: boolean;
  deconstructive?: boolean;
  destructive?: boolean;
}

export const UncontrolledHelloer = (props: UncontrolledHelloerProps) => {
  mockContentRender();
  useEffect(() => mockContentCleanup, []);

  return <pre role="heading">hello {props.name}!</pre>;
};

export const UncontrolledSuspendableHelloer = (
  props: UncontrolledHelloerProps
) => {
  return (
    <Suspension active={!props.name} onActive={props.onName404}>
      <UncontrolledHelloer name={props.name!} />
    </Suspension>
  );
};

export const ControlledSuspendableHelloer = (props: ControlledHelloerProps) => {
  const [name, setName] = useState(props.initialName);
  const [alive, setAlive] = useState(true);

  const waitAndSetNameToSomething = useCallback(() => {
    mockSuspensionEffect();
    const timeoutId = setTimeout(() => setName('🛸'), 500);
    return () => {
      mockSuspensionCleanup();
      clearTimeout(timeoutId);
    };
  }, [setName]);

  const clearName = useCallback(() => {
    setName(undefined);
    if (props.destructive) {
      setTimeout(() => setAlive(false), 250); // this triggers unmount
    }
  }, [props.destructive]);

  useEffect(() => {
    // pre-emptive of the expected suspension
    if (props.destructive && !name) {
      setTimeout(() => setAlive(false), 250); // this triggers unmount
    }
  }, []);

  // this should re-activate the suspension, which creates a loop
  useEffect(() => {
    if (props.deconstructive && name) {
      setTimeout(clearName, 500);
    }
  }, [props.deconstructive, name, clearName]);

  return (
    <>
      {alive && (
        <UncontrolledSuspendableHelloer
          name={name}
          onName404={props.constructive ? waitAndSetNameToSomething : undefined}
        />
      )}
    </>
  );
};

/* w/ hook */

export const UncontrolledHookySuspendableHelloer = (
  props: UncontrolledHelloerProps & { proximative?: boolean }
) => {
  const { proximative, ...baseProps } = props;
  return props.proximative ? (
    <UncontrolledProximativeHookySuspendableHelloer {...baseProps} />
  ) : (
    <UncontrolledUnproximativeHookySuspendableHelloer {...baseProps} />
  );
};

export const UncontrolledUnproximativeHookySuspendableHelloer = (
  props: UncontrolledHelloerProps
) => {
  useSuspension(!props.name, props.onName404);

  return <UncontrolledHelloer name={props.name!} />;
};

export const UncontrolledProximativeHookySuspendableHelloer = withProxiedCleanup(
  (props: UncontrolledHelloerProps & WithProxiedCleanupProps) => {
    useSuspension(!props.name, [props.proxiedCleanupRef, props.onName404]);

    return <UncontrolledHelloer name={props.name!} />;
  }
);

export const ControlledPropyHookySuspendableHelloer = (
  props: ControlledHelloerProps & {
    proximative?: boolean;
  }
) => {
  const [name, setName] = useState(props.initialName);
  const [alive, setAlive] = useState(true);

  const waitAndSetNameToSomething = useCallback(() => {
    mockSuspensionEffect();
    const timeoutId = setTimeout(() => setName('🛸'), 500);
    return () => {
      mockSuspensionCleanup();
      clearTimeout(timeoutId);
    };
  }, [setName]);

  const clearName = useCallback(() => {
    setName(undefined);
    if (props.destructive) {
      setTimeout(() => setAlive(false), 250); // this triggers unmount
    }
  }, [props.destructive]);

  useEffect(() => {
    // pre-emptive of the expected suspension
    if (props.destructive && !name) {
      setTimeout(() => setAlive(false), 250); // this triggers unmount
    }
  }, []);

  // this should re-activate the suspension, which creates a loop
  useEffect(() => {
    if (props.deconstructive && name) {
      setTimeout(clearName, 500);
    }
  }, [props.deconstructive, name, clearName]);

  return (
    <>
      {alive && (
        <UncontrolledHookySuspendableHelloer
          name={name}
          onName404={props.constructive ? waitAndSetNameToSomething : undefined}
          proximative={props.proximative} // passthrough
        />
      )}
    </>
  );
};

export const ControlledStateyHookySuspendableHelloer = (
  props: ControlledHelloerProps
) => {
  const [name, setName] = useState(props.initialName);

  const waitAndSetNameToSomething = useCallback(() => {
    mockSuspensionEffect();
    const timeoutId = setTimeout(() => setName('🛸'), 500);
    return () => {
      mockSuspensionCleanup();
      clearTimeout(timeoutId);
    };
  }, []);

  useSuspension(
    !name,
    props.constructive ? waitAndSetNameToSomething : undefined
  );

  return <UncontrolledHelloer name={name} />;
};
