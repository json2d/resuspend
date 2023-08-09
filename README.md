<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://resuspend.js.org" rel="noopener" target="_blank"><img height="100" src="https://gist.githubusercontent.com/json2d/ffbf9ae39c31a3e1ea1c84277e157f1d/raw/7fa47e68047eb7eaf1bae30eb34b8b5948590c2d/resuspend-final.svg" alt='Resuspend Logo'></a>
</p>

<h1 align="center">resuspend</h1>

<div align="center">

this zero-dependency library provides a `<Suspension/>` component that works w/ the [`<Suspense/>` component from the React API](https://reactjs.org/docs/concurrent-mode-suspense.html) to make implementing _loading states_ super declarative

[![npm](https://img.shields.io/npm/v/resuspend.svg)](https://www.npmjs.com/package/resuspend)
![node](https://img.shields.io/node/v/resuspend.svg)
![license](https://img.shields.io/npm/l/resuspend.svg)
![downloads](https://img.shields.io/npm/dt/resuspend.svg)
![Travis](https://img.shields.io/travis/json2d/resuspend.svg)

<!-- ![Coveralls github](https://img.shields.io/coveralls/github/json2d/resuspend.svg) -->
</div>

## getting started

to install the latest stable version:

```sh
npm i resuspend -S
```

to import it into a module:

```js
import { Suspension } from 'resuspend';
```

## basic example

here's a simple example of a `<DramaticPause/>` component that waits for some amount of time specified by its `duration` prop before finally rendering its `children` prop:

```jsx
import { Suspense, useState, useEffect } from 'react';
import { Suspension } from 'resuspend';

export function DramaticPause(props) {
  // state mapped to the activation status
  const [show, setShow] = useState(!props.duration);

  // activation effect - called when the activation status is set to active
  useEffect(
    function waitAndThenShow() {
      if (!show) {
        const timeoutId = setTimeout(() => setShow(true), props.duration);

        // cleanup callback
        return () => clearTimeout(timeoutId);
      }
    },
    [show, props.duration]
  );

  return (
    <Suspense fallback={<>[pausing dramatically...]</>}>
      <Suspension active={!show}>{props.children}</Suspension>
    </Suspense>
  );
}
```

[try it out in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-lurxwz?file=/src/DramaticPause.jsx)

### props reference

as you can see here above w/ the `<Suspension/>` component working in conjuntion w/ the `useEffect` hook:

- the `active` prop is used to declare whether its _activation status_ is _active_ or _inactive_

- the `waitAndTheShow` effect is used to declare an _activation effect_ to specify what happens when its _activation status_ is switched to _active_ or _inactive_

> essentially, the **suspension logic** is composed of and encapsulated by these values.

## data fetching example

more commonly, your **suspension logic** will probably involve fetching some data from a remote API service and rendering it in some kind of way.

here's a simple example of a `<UserStatus>` component that does just that:

```jsx
import { Suspense, useState, useEffect } from 'react';
import { Suspension } from 'resuspend';

export function UserStatus(props) {
  // state mapped to the activation status
  const [status, setStatus] = useState();

  // activation effect - called when the activation status is set to active
  useEffect(
    function fetchStatus() {
      if (!status) {
        fetch(`/api/status/${props.userId}`)
          .then((response) => response.json())
          .then((data) => setStatus(data.status));
      }
    },
    [status, props.userId]
  );

  return (
    <Suspense fallback={<>[fetching status...]</>}>
      <Suspension active={!status}>{status}</Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

<!-- check out the more complete example of this use-case that "goes all the way" and includes a cleanup callback that [aborts the fetch](#advanced-data-fetching-example)
 -->

## activation

to set the _activation status_ to _active_, you would simply assign the prop `active={true}`:

```jsx
<Suspense fallback={<>[pausing dramatically...]</>}>
  <Suspension active={true}>
    you will not be seeing this text (except here in code) 👀
  </Suspension>
</Suspense>
```

that's all you need to activate a `<Suspension/>` component, consequently triggering its ancestral `<Suspense/>` component and causing it to suspend updating and rendering of its children and instead rendering its `fallback` prop.

## inactivation

likewise to set the _activation status_ to _inactive_, you would simply assign the prop `active={false}`:

```jsx
<Suspense fallback={<>[pausing dramatically...]</>}>
  <Suspension active={false}>you will be seeing this text 👀</Suspension>
</Suspense>
```

## reactivation

in general, using a basic callback is a fine way to switch an _activation status_ from _inactive_ to _active_. this callback can simply be attached to a `useEffect` hook or perhaps to some UI element event, e.g. a button click:

```jsx
import { Suspense, useState, useCallback } from 'react';
import { Suspension } from 'resuspend';

export function DramaticPause(props) {
  // state mapped to the activation status
  const [show, setShow] = useState(!props.duration);

  // activation effect callback - called when the activation status is set to active
  useEffect(
    function waitAndThenShow() {
      if (!show) {
        const timeoutId = setTimeout(() => setShow(true), props.duration);

        // cleanup callback - called when the activation status is switched to inactive
        return () => clearTimeout(timeoutId);
      }
    },
    [show, props.duration]
  );

  // (re)activation callback
  const reload = useCallback(() => setShow(false));

  return (
    <>
      <Suspense fallback={<>[pausing dramatically...]</>}>
        <Suspension active={!show}>{props.children}</Suspension>
      </Suspense>
      <button disabled={!show} onClick={reload}>
        Reload
      </button>
    </>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-w-reactivation-kjijso?file=/src/DramaticPause.jsx)

## lifecycle

as implied so far, a `<Suspension/>` component may be _activated_, _deactivated_, then _reactivated_ and _deactivated_ again, and so on until it's unmounted.

this flow of state encapsulates the _lifecycle_ of `<Suspension/>` components, and is designed intentionally to provide a level of continuity and reusability you'd expect from a decent React component library (especially one whose name starts with `re-`!)
