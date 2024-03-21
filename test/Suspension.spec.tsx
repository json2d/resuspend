// import React so you can use JSX (React.createElement) in your test
import React, { Suspense } from 'react';

/**
 * render: lets us render the component (like how React would)
 * screen: Your utility for finding elements the same way the user does
 **/
import { act, render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import {
  mockConstructiveEffect,
  mockDeconstructiveEffect,
  mockDestructiveEffect,
  mockContentRender,
  mockContentCleanup,
  ControlledSuspendableHelloer,
} from './fixtures/Helloer';
import SuspensionAlert from '../stories/components/SuspensionAlert';
import ComplementaryNote from '../stories/components/ComplementaryNote';

// const sleep = async (dur) => new Promise((resolve) => setTimeout(resolve, dur));

beforeEach(mockConstructiveEffect.mockReset);
beforeEach(mockDeconstructiveEffect.mockReset);
beforeEach(mockDestructiveEffect.mockReset);
beforeEach(mockContentRender.mockReset);
beforeEach(mockContentCleanup.mockReset);

describe('given an `App` component that renders a bound `Suspension` component', () => {
  describe('when initial render and the `Suspension` component `active` prop is false', () => {
    test('should not suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName="🌎" />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });
      expect(screen.queryByRole('heading')).not.toBeNull();
    });
  });
  describe('when initial render and the `Suspension` component `active` prop is true', () => {
    test('should suspend', () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName={undefined} />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });

      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when initial render suspends and then unmounts', () => {
    test('should unsuspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName={undefined} destructive />
          <ComplementaryNote />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });
      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('note')).toBeNull();

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when initial render suspends and then the `Suspension` component `active` prop changes to false', () => {
    test('should unsuspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName={undefined} constructive />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });
      expect(screen.queryByRole('alert')).not.toBeNull();
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when initial render does not suspend and then the `Suspension` component `active` prop changes to true', () => {
    test('should suspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName="🌎" deconstructive />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });
      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(mockDeconstructiveEffect.mock.calls.length).toBe(1);

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();
    });
  });
  describe('when update render suspends and then the `Suspension` component unmounts', () => {
    test('should unsuspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer
            initialName="🌎"
            deconstructive
            destructive
          />
          <ComplementaryNote />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('note')).toBeNull();

      await waitFor(() => screen.getByRole('note'));
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
  describe('when update render suspends and then the `Suspension` component `active` prop changes to false', () => {
    test('should unsuspend', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer
            initialName="🌎"
            deconstructive
            constructive
          />
          <ComplementaryNote />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });

      await waitFor(() => screen.getByRole('alert'));
      expect(screen.queryByRole('heading')).toBeNull();

      await waitFor(() => screen.getByRole('heading'));
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
});

describe('given an `App` component that renders a bound `Suspension` component w/ `children` node', () => {
  describe('when initial render and `active` is truthy', () => {
    test('should suspend and not start rendering `children` node', async () => {
      const App = () => (
        <Suspense fallback={<SuspensionAlert />}>
          <ControlledSuspendableHelloer initialName={undefined} />
        </Suspense>
      );

      act(() => {
        render(<App />);
      });

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

      act(() => {
        render(<App />);
      });

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(mockContentRender.mock.calls.length).toBe(1);

      await waitFor(() => screen.getByRole('alert'));
      expect(mockContentCleanup.mock.calls.length).toBe(0);
    });
  });
});
