import React, { Suspense } from 'react';
import { Meta, Story } from '@storybook/react';

import './styles.css';
import { Suspension } from '../src';

const meta: Meta = {
  title: 'SuspensionWithRenderPropController',
};

export default meta;

const Template: Story = () => (
  <Suspense fallback={<pre role="alert">[pausing dramatically...]</pre>}>
    <Suspension>
      {controller => (
        <button onClick={controller._suspend}>activate</button> 
        // doesn't work as expected, thrown Promise that doesn't get caught
      )}
    </Suspension>
  </Suspense>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};