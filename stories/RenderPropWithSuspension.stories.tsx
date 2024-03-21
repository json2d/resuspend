import React, { Suspense, useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';

import './styles.css';
import { Suspension } from '../src/Suspension';

const meta: Meta = {
  title: 'RenderPropWithSuspension.stories',
  // component: UnboundDramaticHelloer,
};

export default meta;

interface User {
  name: string;
}

interface UserProviderProps {
  children: (user?: User) => React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const populateUser = async () => {
      await new Promise(res => setTimeout(res, 3000));
      setUser({ name: 'world' });
    };
    populateUser();
  }, []);

  return <>{children(user)}</>;
};

const Template: Story = () => (
  <Suspense fallback={<pre role="alert">[pausing dramatically...]</pre>}>
    <UserProvider>
      {user => (
        <Suspension active={!user}>
          <pre>hello {user?.name}</pre>
        </Suspension>
      )}
    </UserProvider>
  </Suspense>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
