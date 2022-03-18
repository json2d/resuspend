import React from 'react';
import { Meta, Story } from '@storybook/react';

import './styles.css';
import DemoHelloer from './components/DemoHelloer';
import { ControlledHelloerProps } from '../test/fixtures/Helloer';

const meta: Meta = {
  title: 'DemoHelloer',
  component: DemoHelloer,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<ControlledHelloerProps> = (args) => (
  <DemoHelloer {...args} />
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  constructive: true,
  deconstructive: false,
  destructive: false,
};
