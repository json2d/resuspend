import React, { FC, useCallback, useContext } from 'react';

import { AnyAction } from 'redux';
import { createSelectorHook, ReactReduxContext, Selector } from 'react-redux';

import { Suspension } from 'resuspend';

export interface ConnectedSuspensionProps {
  context: React.Context<any>;
  activeSelector: Selector<any, boolean>;
  onActiveSelector?: Selector<any, AnyAction>;
}
/**
 * this `<Suspension/>` based React component uses a Redux selector prop to control the activation status 🤟🏽
 * as well as another optional selector prop that selects an action to dispatch as the activation effect
 * when the activation status is switched to active
 * @component
 *
 * Example:
 *
 * - [basic example](https://github.com/json2d/resuspend/blob/main/packages/redux#basic-example)
 *
 */
export const ConnectedSuspension: FC<ConnectedSuspensionProps> = (props) => {
  // be careful w/ accessing the store this way - may deprecate in the future
  // - ref: https://react-redux.js.org/using-react-redux/accessing-store#using-reactreduxcontext-directly
  const { store } = useContext(props.context);

  // using callback to manage dynamic hook
  const useContextualSelector = useCallback(createSelectorHook(props.context), [
    props.context,
  ]);

  // this makes the component perform an update render when `active` changes
  const active = useContextualSelector(props.activeSelector);

  const onActive = useCallback(() => {
    if (props.onActiveSelector) {
      console.debug('dispatching reaction to suspension becoming active');
      const reaction = props.onActiveSelector(store.getState());
      store.dispatch(reaction);
    }
  }, [props.onActiveSelector, store]);

  return (
    <Suspension active={active} onActive={onActive}>
      {props.children}
    </Suspension>
  );
};

ConnectedSuspension.defaultProps = {
  context: ReactReduxContext,
};
