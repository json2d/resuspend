// import React so you can use JSX (React.createElement) in your test
import React, { Suspense, useCallback, useEffect, useState } from 'react';

/**
 * render: lets us render the component (like how React would)
 * screen: Your utility for finding elements the same way the user does
 **/
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import {
  mockSuspensionEffect,
  mockSuspensionCleanup,
  mockContentRender,
  mockContentCleanup,
  ControlledHelloerProps,
  ControlledSuspendableHelloer,
  UncontrolledSuspendableHelloer,
} from './fixtures/Helloer';
import SuspensionAlert from '../stories/components/SuspensionAlert';
import ComplementaryNote from '../stories/components/ComplementaryNote';

// const sleep = async (dur) => new Promise((resolve) => setTimeout(resolve, dur));

beforeEach(mockSuspensionEffect.mockReset);
beforeEach(mockSuspensionCleanup.mockReset);
beforeEach(mockContentRender.mockReset);
beforeEach(mockContentCleanup.mockReset);

describe('given `active` uses local state and `onActive` is nully', () => {
  describe('when initial render and `active` is false', () => {
    test('should not suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName="🌎" />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('heading')).not.toBeNull();

      expect(mockSuspensionEffect.mock.calls.length).toBe(0);
    });
  });
  describe('when initial render and `active` is true', () => {
    test('should suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when initial render suspends and then unmounts', () => {
    test('should unsuspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer destructive />
          <ComplementaryNote />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('note')).toBeNull();

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when initial render suspends and then initial render retries and `active` changes to false', () => {
    test('should unsuspend', async () => {
      const App = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useEffect(() => {
          setTimeout(() => setName('🛸'), 500); // this triggers initial render retry
        }, []);

        return (
          <Suspense fallback={<SuspensionAlert />}>
            <UncontrolledSuspendableHelloer name={name} />
          </Suspense>
        );
      };

      render(<App />);
      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when update render and `active` changes to true', () => {
    test('should suspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer deconstructive initialName="🌎" />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when update render suspends and then unmounts', () => {
    test('should unsuspend', async () => {
      const App = (props: ControlledHelloerProps) => {
        const [show, setShow] = useState(true);
        const [name, setName] = useState(props.initialName);

        const clearName = useCallback(() => setName(undefined), []);

        useEffect(() => {
          setTimeout(clearName, 500); // this triggers update render
          setTimeout(() => setShow(false), 1000); // this triggers unmount
        }, []);

        return (
          <Suspense fallback={<SuspensionAlert />}>
            {show && <UncontrolledSuspendableHelloer name={name} />}
            <ComplementaryNote />
          </Suspense>
        );
      };

      render(<App initialName="🌎" />);

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('note')).toBeNull();

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when update render suspends and update render retries and `active` changes to false', () => {
    test('should unsuspend', async () => {
      const App = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        const clearName = useCallback(() => setName(undefined), []);

        useEffect(() => {
          setTimeout(clearName, 500); // this triggers update render
          setTimeout(() => setName('🛸'), 1000); // this triggers update render that unsuspends
        }, []);

        return (
          <Suspense fallback={<SuspensionAlert />}>
            <UncontrolledSuspendableHelloer name={name} />
          </Suspense>
        );
      };

      render(<App initialName="🌎" />);

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
});

describe('given `onActive` updates local state to make `active` false', () => {
  describe('when initial render and `active` is false', () => {
    test('should not suspend and not do `onActive`', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer constructive initialName="🌎" />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('heading')).not.toBeNull();

      expect(mockSuspensionEffect.mock.calls.length).toBe(0);
      expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
    });
  });
  describe('when initial render and `active` is true', () => {
    test('should suspend and do `onActive`, then unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer constructive />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();

      // wait for `onActive` to be called
      // this is not sync w/ `Suspense` fallback render, but it should be done right after
      await waitFor(() => {
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(mockSuspensionEffect.mock.calls.length).toBe(1);
      await waitFor(() =>
        expect(mockSuspensionCleanup.mock.calls.length).toBe(1)
      );
    });
  });
  describe('when initial render suspends and then unmounts', () => {
    test('should unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer constructive destructive />
          <ComplementaryNote />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('note')).toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(0);

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('note')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
    });
  });
  describe('when update render and `active` is true', () => {
    test('should suspend and do `onActive`, then unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer
            initialName="🌎"
            deconstructive
            constructive
          />
        </Suspense>
      );

      render(<App />);

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => {
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
      expect(mockSuspensionEffect.mock.calls.length).toBe(1);
    });
  });
  describe('when update render suspends and then unmounts', () => {
    test('should unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer
            initialName="🌎"
            deconstructive
            constructive
            destructive
          />
          <ComplementaryNote />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('heading')).not.toBeNull();

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('note')).toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(0);

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() =>
        expect(mockSuspensionCleanup.mock.calls.length).toBe(1)
      );
    });
  });
});

describe('given `children` node', () => {
  describe('when initial render and `active` is truthy', () => {
    test('should suspend and not start rendering `children` node', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(mockContentRender.mock.calls.length).toBe(0);
    });
  });
  describe('when update render and `active` is truthy', () => {
    test('should suspend and not unmount `children` node ⚡(optimal)', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName="🌎" deconstructive />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(mockContentRender.mock.calls.length).toBe(1);

      await waitFor(() => screen.getByRole('alert'));
      expect(mockContentCleanup.mock.calls.length).toBe(0);
    });
  });
});
