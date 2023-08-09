// need this because components also used in unit-tests and just global jest mock functions
// https://stackoverflow.com/questions/64349461/make-jest-globally-available-in-storybook/64369676
import jest from 'jest-mock';
window.jest = jest;

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};
