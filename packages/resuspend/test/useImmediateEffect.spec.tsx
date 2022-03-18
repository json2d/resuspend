// import React so you can use JSX (React.createElement) in your test
import React, { useRef, useState } from 'react';

/**
 * render: lets us render the component (like how React would)
 * screen: Your utility for finding elements the same way the user does
 **/
import { render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

import { useImmediateEffect, withProxiedCleanup } from '../src';
import { WithProxiedCleanupProps } from '../src/withProxiedCleanup';
import {
  UncontrolledHelloer,
  ControlledHelloerProps,
} from './fixtures/Helloer';
import { sleep } from './libs/helpers';

describe('given `effect` updates global', () => {});
describe('given `effect` updates props async', () => {});
describe('given `effect` updates local state (sync)', () => {
  describe('when initial render and `deps` is empty', () => {
    test('should do `effect` #1`, then update render but not do `effect` again (sync)', () => {
      const mockEffect = jest.fn();
      const mockRender = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          mockEffect();
          setName('🛸');
        }, []);

        mockRender();

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
      expect(mockEffect.mock.calls.length).toBe(1);
      expect(mockRender.mock.calls.length).toBe(2);
    });
  });
});
describe('given `effect` updates local state (async)', () => {
  describe('when initial render and `deps` is empty', () => {
    test('should do `effect` #1, then update render but not do `effect` again (async)', async () => {
      const mockEffect = jest.fn();
      const mockRender = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          mockEffect();
          setTimeout(() => setName('🛸'), 500); // triggers update render
        }, []);

        mockRender();

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockEffect.mock.calls.length).toBe(1);
      expect(mockRender.mock.calls.length).toBe(1);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockEffect.mock.calls.length).toBe(1); // effect not fire again
        expect(mockRender.mock.calls.length).toBe(2);
      });
    });
  });
  describe('when initial render and `deps` is nully', () => {
    test('should do `effect` #1, the update render and do effect #2, #3, etc', async () => {
      const mockEffect = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          mockEffect();
          setTimeout(() => setName('🛸'), 500); // triggers update render
        });

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockEffect.mock.calls.length).toBe(1);
      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockEffect.mock.calls.length).toBe(2);
      });
      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockEffect.mock.calls.length).toBe(3);
      });
    });
  });
});

describe('given `effect` updates local state (async) and `deps` uses local state', () => {
  describe('when initial render', () => {
    test('should do `effect` #1 and not do cleanup #1', async () => {
      const mockEffect = jest.fn();
      const mockCleanup = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          mockEffect();
          setTimeout(() => setName(`🛸`), 500);
          return mockCleanup;
        }, [name]);

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      // initial render
      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockEffect.mock.calls.length).toBe(1);
      expect(mockCleanup.mock.calls.length).toBe(0);
    });
  });
  describe('when update render and `deps` same', () => {
    test('should not do `effect` #2 and not do cleanup #1', async () => {
      const mockEffect = jest.fn();
      const mockCleanup = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          mockEffect();
          setTimeout(() => setName(`🛸`), 500);
          return mockCleanup;
        }, [name]);

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      // initial render
      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockEffect.mock.calls.length).toBe(1);
      expect(mockCleanup.mock.calls.length).toBe(0);

      await waitFor(() => {
        // update render on deps changed
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockEffect.mock.calls.length).toBe(2);
        expect(mockCleanup.mock.calls.length).toBe(1);
      });

      await sleep(500);
      await waitFor(() => {
        // unchanged
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockEffect.mock.calls.length).toBe(2);
        expect(mockCleanup.mock.calls.length).toBe(1);
      });
    });
  });
  describe('when update render and `deps` change #1', () => {
    test('should do cleanup #1', async () => {
      const mockCleanup = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(() => {
          setTimeout(() => setName('🛸'), 500);
          return mockCleanup;
        }, [name]);

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockCleanup.mock.calls.length).toBe(0);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockCleanup.mock.calls.length).toBe(1);
      });

      await sleep(1000);

      expect(mockCleanup.mock.calls.length).toBe(1);
    });
    test('should do cleanup #1 (w/ cleanup registered asynchronously)', async () => {
      const mockCleanup = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);

        useImmediateEffect(
          (registerCleanup) => {
            setTimeout(() => setName('🛸'), 500);
            registerCleanup(mockCleanup);
          },
          [name]
        );

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockCleanup.mock.calls.length).toBe(0);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockCleanup.mock.calls.length).toBe(1);
      });

      await sleep(1000);

      expect(mockCleanup.mock.calls.length).toBe(1);
    });

    test('should do cleanup #1 (w/ cleanup proxy)', async () => {
      const mockCleanup = jest.fn();
      const CustomHelloer = withProxiedCleanup(
        (props: ControlledHelloerProps & WithProxiedCleanupProps) => {
          const [name, setName] = useState(props.initialName);

          useImmediateEffect(
            // dependency injection
            [
              props.proxiedCleanupRef,
              () => {
                setTimeout(() => setName('🛸'), 500);
                return mockCleanup;
              },
            ],
            [name]
          );

          return <UncontrolledHelloer name={name} />;
        }
      );

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockCleanup.mock.calls.length).toBe(0);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸');
        expect(mockCleanup.mock.calls.length).toBe(1);
      });

      await sleep(1000);

      expect(mockCleanup.mock.calls.length).toBe(1);
    });
  });
  describe('when update render and `deps` change repeatedly', () => {
    test('should do `effect` and cleanup on each change', async () => {
      const mockEffect = jest.fn();
      const mockCleanup = jest.fn();

      const CustomHelloer = (props: ControlledHelloerProps) => {
        const [name, setName] = useState(props.initialName);
        const counter = useRef(0);

        useImmediateEffect(() => {
          counter.current++;
          mockEffect();
          setTimeout(() => setName(`🛸 #${counter.current}`), 500);
          return mockCleanup;
        }, [name]);

        return <UncontrolledHelloer name={name} />;
      };

      render(<CustomHelloer initialName="🌎" />);

      expect(screen.getByRole('heading')).toHaveTextContent('hello 🌎');
      expect(mockEffect.mock.calls.length).toBe(1); // initial render
      expect(mockCleanup.mock.calls.length).toBe(0); // initial render

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸 #1');
        expect(mockEffect.mock.calls.length).toBe(2); // update on deps changed
        expect(mockCleanup.mock.calls.length).toBe(1); // update on deps changed
      });

      await waitFor(() => {
        expect(screen.getByRole('heading')).toHaveTextContent('hello 🛸 #2');
        expect(mockEffect.mock.calls.length).toBe(3); // update on deps changed
        expect(mockCleanup.mock.calls.length).toBe(2); // update on deps changed
      });
    });
  });
});
