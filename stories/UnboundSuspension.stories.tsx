import React, { Suspense } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  UnboundDramaticHelloer,
} from './components/Helloer';

import './styles.css';

const meta: Meta = {
  title: 'UnboundDramaticHelloer',
  component: UnboundDramaticHelloer,
};

export default meta;

const Template: Story = () => (
  <Suspense fallback={<pre role="alert">[pausing dramatically...]</pre>}>
    <UnboundDramaticHelloer/>
  </Suspense>
);


// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
