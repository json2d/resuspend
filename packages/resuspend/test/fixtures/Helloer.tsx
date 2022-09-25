import React, { useEffect, useState } from 'react';
import { Suspension } from '../../src';

export const mockConstructiveEffect = jest.fn();
export const mockConstructiveCleanup = jest.fn();

export const mockDeconstructiveEffect = jest.fn();
export const mockDeconstructiveCleanup = jest.fn();

export const mockDestructiveEffect = jest.fn();
export const mockDestructiveCleanup = jest.fn();

export const mockContentRender = jest.fn();
export const mockContentCleanup = jest.fn();

export interface UncontrolledHelloerProps {
  name?: string;
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
    <Suspension active={!props.name}>
      <UncontrolledHelloer name={props.name!} />
    </Suspension>
  );
};

export const ControlledSuspendableHelloer = (props: ControlledHelloerProps) => {
  const [name, setName] = useState(props.initialName);
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    mockConstructiveEffect();
    if (props.constructive && !name) {
      const timeoutId = setTimeout(() => setName('🛸'), 500);
      return () => {
        mockConstructiveCleanup();
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [props.constructive, name]);

  // this should re-activate the suspension, which creates a loop
  useEffect(() => {
    if (props.deconstructive && name) {
      mockDeconstructiveEffect();
      const timeoutId = setTimeout(() => setName(undefined), 500); // this triggers unmount
      return () => {
        mockDeconstructiveCleanup();
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [props.deconstructive, name]);

  useEffect(() => {
    // pre-emptive of the expected suspension
    if (props.destructive && !name) {
      mockDestructiveEffect();
      const timeoutId = setTimeout(() => setAlive(false), 250); // this triggers unmount
      return () => {
        mockDestructiveCleanup();
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [props.destructive, name]);

  return <>{alive && <UncontrolledSuspendableHelloer name={name} />}</>;
};
