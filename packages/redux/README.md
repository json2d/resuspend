<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://resuspend.js.org" rel="noopener" target="_blank"><img height="100" src="https://gist.githubusercontent.com/json2d/ffbf9ae39c31a3e1ea1c84277e157f1d/raw/f8e8cba55285fc33c6073748920a6aa060e71eab/resuspend-redux.svg" alt='Resuspend Logo'></a>
</p>

<h1 align="center">@resuspend/redux</h1>

<div align="center">

this integration of the core [`resuspend`](https://github.com/json2d/resuspend/blob/main/packages/resuspend) library w/ the [Redux](https://redux.js.org) state management library provides a `<ConnectedSuspension/>` component which uses [selectors, actions, and store state](https://redux.js.org/introduction/core-concepts) as the basis for implementing your **suspension logic**

[![npm](https://img.shields.io/npm/v/resuspend.svg)](https://www.npmjs.com/package/@resuspend/redux)
![node](https://img.shields.io/node/v/@resuspend/redux.svg)
![npm](https://img.shields.io/npm/l/@resuspend/redux.svg)
![npm](https://img.shields.io/npm/dt/@resuspend/redux.svg)

<!-- ![Travis](https://img.shields.io/travis/resuspend/redux.svg) -->

</div>

## getting started

To install the latest stable version:

```sh
npm i -s resuspend @resuspend/redux
```

## basic example

here's a simple example of Redux based **suspension logic**.

starting with a base component:

```js
import React from "react";

export const UserProfile = (props) => (
  <div>
    <h1>{props.user.name}</h1>
    <pre>@{props.user.id}</pre>
    <p>{props.user.status}</p>
    <button onClick={props.onRefresh}>Refresh</button>
  </div>
);
```

set up a typical connection between the base component and the store state:

```jsx
import React, { useCallback } from "react";

// action creators
const setUser = (payload) => ({ type: 'SET_USER', payload });
const refreshUser = (payload) => ({ type: 'REFRESH_USER', payload });

// selectors
const getUserWithId = (userId) => (state) => state.userById[userId];

export const ConnectedUserProfile = (props) => {
  const getUser = useCallback(getUserWithId(props.userId), [props.userId]);

  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const onRefresh = useCallback(() => {
    dispatch(refreshUser({ userId: props.userId }));
  }, [dispatch, props.userId]);

  return <UserProfile user={user} onRefresh={onRefresh} />;
};
```

then finally, you can define the **suspension logic** w/ selectors and assign it to the props of a `<ConnectedSuspension>` component:

```jsx
import React, { useCallback } from "react";
import { ConnectedSuspension } from '@resuspend/redux';

import * as mocks from "../mocks"; // mock users for simulating fetch below

// activation status via a store selector
const noUserWithId = (userId) => (state) => !getUserWithId(userId)(state);

// activation effect via an action selector
const fetchUserWithId = (userId) => (state) => /* thunk you! */ (dispatch) => {
  // simulate fetch
  setTimeout(() => {
    const user = mocks.users[userId];
    dispatch(setUser({ user }));
  }, 2000);
};

export const SuspendableConnectedUserProfile = (props) => {
  const noUser = useCallback(noUserWithId(props.userId), [props.userId]);
  const fetchUser = useCallback(fetchUserWithId(props.userId), [props.userId]);

  return (
    <ConnectedSuspension activeSelector={noUser} onActiveSelector={fetchUser}>
      <ConnectedUserProfile {...props} />
    </ConnectedSuspension>
  );
};
```
[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-redux-basic-example-yqke2s?file=/src/components/UserProfile.jsx)