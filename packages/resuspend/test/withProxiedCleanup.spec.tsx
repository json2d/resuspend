// import React so you can use JSX (React.createElement) in your test
import React from 'react';

/**
 * render: lets us render the component (like how React would)
 * screen: Your utility for finding elements the same way the user does
 **/
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import { withProxiedCleanup } from '../src';

describe('given `WrappedComponent` assigns a cleanup to `proxiedCleanupRef` prop', () => {
  const mockCleanup = jest.fn();

  beforeEach(mockCleanup.mockReset);

  const CustomHelloer = withProxiedCleanup((props) => {
    props.proxiedCleanupRef.current = mockCleanup;
    return <p role="heading">hello 🌎</p>;
  });

  describe('when inital render', () => {
    test('should render `WrappedComponent` and not do cleanup', () => {
      render(<CustomHelloer />);

      expect(screen.queryByRole('heading')).not.toBeNull();
      expect(mockCleanup.mock.calls.length).toBe(0);
    });
  });
  describe('when unmounts', () => {
    test('should do cleanup', async () => {
      const { unmount } = render(<CustomHelloer />);

      unmount();

      await waitFor(() => {
        expect(mockCleanup.mock.calls.length).toBe(1);
      });
    });
  });
});
