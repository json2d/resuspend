<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://resuspend.js.org" rel="noopener" target="_blank"><img height="100" src="https://gist.githubusercontent.com/json2d/ffbf9ae39c31a3e1ea1c84277e157f1d/raw/7fa47e68047eb7eaf1bae30eb34b8b5948590c2d/resuspend-final.svg" alt='Resuspend Logo'></a>
</p>

<h1 align="center">resuspend</h1>

<div align="center">

this unassuming library provides a `<Suspension/>` component which is designed to work together w/ the [`<Suspense/>` component from the React API](https://reactjs.org/docs/concurrent-mode-suspense.html) in order to facilitate whatever **suspension logic** you may wish to implement in your [React](https://reactjs.org/) app, with an initial focus on *content fulfillment* and *user experience pacing* as the primary use cases

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
import { Suspension } from "resuspend";
```

## basic example

here's a simple example of a `<DramaticPause/>` component that waits for some amount of time specified by its `duration` prop before finally rendering its `children` prop:

```jsx
import { Suspense, useState, useCallback } from "react";
import { Suspension } from "resuspend";

export function DramaticPause(props) {
  // state mapped to the activation status
  const [show, setShow] = useState(!props.duration);

  // activation effect callback - called when the activation status is set to active
  const waitAndThenShow = useCallback(() => {
    const timeoutId = setTimeout(() => setShow(true), props.duration);

    // cleanup callback - called when the activation status is switched to inactive
    return () => clearTimeout(timeoutId);
  }, [props.duration]);

  return (
    <Suspense fallback={<>[pausing dramatically...]</>}>
      <Suspension active={!show} onActive={waitAndThenShow}>
        {props.children}
      </Suspension>
    </Suspense>
  );
}
```

[try it out in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-lurxwz?file=/src/DramaticPause.jsx)

### props reference

as you can see here above in the values assigned to the `<Suspension/>` component props:

- its `active` prop is used to declare whether its *activation status* is *active* or *inactive*
- its `onActive` prop is used to declare an *activation effect* to specify what happens when its *activation status* is switched to *active* or *inactive*

> essentially, the **suspension logic** is composed of and encapsulated by the values assigned to these props.

### highly effect-ish

notably, the `onActive` prop is *typed* the same as the callback you'd normally pass into the [`useEffect` hook from the React API](https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1).

this parity between _activation effects_ and standard effects includes the [cleanup callback](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup) that can be returned (optionally) - this is called when the _activation status_ is switched from _active_ to _inactive_ or when the `<Suspension/>` is unmounted.

<!-- see more in the later sections about how [activation effects](basic-usage/activation-effects.mdx) work in practice and "under the hood." -->

## data fetching example

more commonly, your **suspension logic** will probably involve fetching some data from a remote API service and rendering it in some kind of way.

here's a simple example of a `<UserStatus>` component that does just that:

```jsx
import { Suspense, useState, useCallback } from "react";
import { Suspension } from "resuspend";

export function UserStatus(props) {
  // state mapped to the activation status
  const [status, setStatus] = useState();

  // activation effect callback - called when the activation status is set to active
  const fetchStatus = useCallback(() => {
    fetch(`/api/status/${props.userId}`) 
      .then((response) => response.json())
      .then((data) => setStatus(data.status));
  }, [props.userId]);

  return (
    <Suspense fallback={<>[fetching status...]</>}>
      <Suspension active={!status} onActive={fetchStatus}>
        {status}
      </Suspension>
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
  <Suspension active={false}>
    you will be seeing this text 👀
  </Suspension>
</Suspense>
```

you may also assign a callback to the `active` prop and it will be evaluated to _active_ (for truthy values) or _inactive_ (for falsey values.)

```jsx
<Suspense fallback={<>[pausing randomly and dramatically...]</>}>
  <Suspension active={() => Math.random() >= .5}>
    you will maybe be seeing this text 👀
  </Suspension>
</Suspense>
```

## async deactivation via an activation effect

the `<Suspension/>` component's `onActive` prop is used to declaratively specify an _activation effect_ - this is what happens when its _activation status_ is switched to _active_ or _inactive_.

using this mechanism is the recommended approach to switch an _activation status_ from _active_ to _inactive_.

```jsx
<Suspense fallback={<>[pausing dramatically...]</>}>
  <Suspension active={!show} onActive={waitAndThenShow}>
    {props.children}
  </Suspension>
</Suspense>
```

check out the [basic example](#basic-example) above for the full source which includes how the `waitAndThenShow` callback is implemented w/ a `useCallback` hook.

## reactivation

in general, using a basic callback is a fine way to switch an _activation status_ from _inactive_ to _active_. this callback can simply be attached to a `useEffect` hook or perhaps to some UI element event, e.g. a button click:

```jsx
import { Suspense, useState, useCallback } from "react";
import { Suspension } from "resuspend";

export function DramaticPause(props) {
  // state mapped to the activation status
  const [show, setShow] = useState(!props.duration);

  // activation effect callback - called when the activation status is set to active
  const waitAndThenShow = useCallback(() => {
    const timeoutId = setTimeout(() => setShow(true), props.duration);

    // cleanup callback - called when the activation status is switched to inactive
    return () => clearTimeout(timeoutId);
  }, [props.duration]);

  // (re)activation callback
  const reload = useCallback(() => setShow(false));

  return (
    <>
      <Suspense fallback={<>[pausing dramatically...]</>}>
        <Suspension active={!show} onActive={waitAndThenShow}>
          {props.children}
        </Suspension>
      </Suspense>
      <button disabled={!show} onClick={reload}>Reload</button>
    </>
  );
}
```
[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-w-reactivation-kjijso?file=/src/DramaticPause.jsx)


## lifecycle

as implied so far, a `<Suspension/>` component may be _activated_, _deactivated_, then _reactivated_ and _deactivated_ again, and so on until it's unmounted.

this flow of state encapsulates the  _lifecycle_ of  `<Suspension/>` components, and is designed intentionally to provide a level of continuity and reusability you'd expect from a decent React component library (especially one whose name starts with `re-`!)
