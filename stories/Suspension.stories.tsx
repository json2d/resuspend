import React from 'react';
import { Meta, Story } from '@storybook/react';
import { DramaticHelloer, DramaticHelloerProps } from './components/Helloer';

import './styles.css';

const meta: Meta = {
  title: 'DramaticHelloer',
  component: DramaticHelloer,
  argTypes: {
    pauseDuration: {
      control: {
        type: 'number',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<DramaticHelloerProps> = (args) => (
  <DramaticHelloer {...args} />
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  pauseDuration: 2000,
  name: '🌎',
  tagline: 'hang in there!',
};
