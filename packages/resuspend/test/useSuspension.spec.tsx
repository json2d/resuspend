// import React so you can use JSX (React.createElement) in your test
import React, { Suspense, useCallback, useEffect, useState } from 'react';

/**
 * render: lets us render the component (like how React would)
 * screen: Your utility for finding elements the same way the user does
 **/
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import SuspensionAlert from '../stories/components/SuspensionAlert';
import ComplementaryNote from '../stories/components/ComplementaryNote';
import {
  ControlledHelloerProps,
  ControlledStateyHookySuspendableHelloer,
  ControlledPropyHookySuspendableHelloer,
  UncontrolledHookySuspendableHelloer,
  mockSuspensionCleanup,
  mockSuspensionEffect,
} from './fixtures/Helloer';

import { sleep } from './libs/helpers';

// const container = (inner: JSX.Element) => (
//   <Suspense fallback={<SuspensionAlert />}>{inner}</Suspense>
// );

beforeEach(mockSuspensionEffect.mockReset);
beforeEach(mockSuspensionCleanup.mockReset);

describe('given `condition` uses local state and `reaction` updates local state to make `condition` falsey', () => {
  describe('when initial render and `condition` is falsey', () => {
    test('should not suspend and not do `reaction`', () => {
      const App = () => (
        <Suspense fallback={SuspensionAlert}>
          <ControlledStateyHookySuspendableHelloer
            constructive
            initialName="🌎"
          />
        </Suspense>
      );
      render(<App />);

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when initial render and `condition` is truthy', () => {
    test('should suspend and do `reaction` then fail to unsuspend because a component in suspense pauses processing of its local state updates 🔪(edge-case) ', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledStateyHookySuspendableHelloer constructive />
        </Suspense>
      );
      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();

      await waitFor(() => {
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });

      await sleep(500);

      // no changes
      expect(screen.queryByRole('alert')).not.toBeNull();
    });
  });
});
describe('given `condition` uses props and `reaction` is nully', () => {
  describe('when initial render and `condition` is truthy', () => {
    test('should suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when retry initial render and `condition` changes to falsey', () => {
    test('should unsuspend', async () => {
      const App = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        const waitAndSetNameToSomething = useCallback(
          () => void setTimeout(() => setName('🛸'), 500),
          [setName]
        );

        useEffect(waitAndSetNameToSomething, []);

        return (
          <Suspense fallback={<SuspensionAlert />}>
            <UncontrolledHookySuspendableHelloer name={name} />
          </Suspense>
        );
      };

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeNull();
        expect(screen.queryByRole('alert')).toBeNull();
      });
    });
  });
  describe('when initial render and `condition` is falsey', () => {
    test('should not suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <UncontrolledHookySuspendableHelloer name="🌎" />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when update render and `condition` changes to truthy', () => {
    test('should suspend', async () => {
      const App = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        const waitAndClearName = useCallback(
          () => void setTimeout(() => setName(undefined), 500),
          [setName]
        );

        useEffect(waitAndClearName, []);

        return (
          <Suspense fallback={<SuspensionAlert />}>
            <UncontrolledHookySuspendableHelloer name={name} />
          </Suspense>
        );
      };

      render(<App initialName="🌎" />);

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeNull();
        expect(screen.queryByRole('heading')).toBeNull();
      });
    });
  });
});
describe('given `condition` uses props and `reaction` updates props such that `condition` is falsey', () => {
  describe('when initial render and `condition` is truthy', () => {
    test('should suspend and do `reaction` then unsuspend and fail to do cleanup (w/o cleanup proxy)', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer constructive />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('alert')).not.toBeNull();

      await waitFor(() => {
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
      });

      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeNull();
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });
    });
    test('should suspend and do `reaction` then unsuspend and do cleanup (w/ cleanup proxy)', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer constructive proximative />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('alert')).not.toBeNull();

      await waitFor(() => {
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
      });

      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeNull();
        expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
      });
    });
  });
  describe('when initial render suspends and then unmounts', () => {
    test('should unsuspend and fail cleanup (w/o cleanup proxy)', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer constructive destructive />
          <ComplementaryNote />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      await sleep(500);
      expect(screen.queryByRole('note')).not.toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
    });
    test('should unsuspend and do cleanup (w/ cleanup proxy)', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer
            constructive
            destructive
            proximative
          />
          <ComplementaryNote />
        </Suspense>
      );

      render(<App />);

      expect(screen.queryByRole('alert')).not.toBeNull();
      await sleep(500);
      expect(screen.queryByRole('note')).not.toBeNull();
      expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
    });
  });
  describe('when retry initial render and `reaction` changes', () => {
    test('should do cleanup and do new `reaction`', () => {});
  });
  describe('when initial render and `condition` is falsey', () => {
    test('should not suspend and not do `reaction`', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer
            constructive
            initialName="🌎"
          />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(mockSuspensionEffect.mock.calls.length).toBe(0);
    });
  });
  describe('when update render and `condition` changes to truthy', () => {
    test('should suspend and do `reaction` then unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer
            constructive
            deconstructive
            initialName="🌎"
          />
        </Suspense>
      );

      render(<App />);
      expect(screen.queryByRole('heading')).not.toBeNull();

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeNull();
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeNull();
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
      });
    });
  });
  describe('when update render suspends and then unmounts', () => {
    test('should unsuspend and do cleanup', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledPropyHookySuspendableHelloer
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

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeNull();
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('note')).not.toBeNull();
        expect(screen.queryByRole('heading')).toBeNull();
        expect(mockSuspensionEffect.mock.calls.length).toBe(1);
        expect(mockSuspensionCleanup.mock.calls.length).toBe(1);
      });
    });
  });
  describe('when retry update render and `reaction` changes', () => {
    test('should do cleanup and do next `reaction`', () => {});
  });
});
