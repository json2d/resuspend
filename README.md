<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://resuspend.js.org" rel="noopener" target="_blank"><img height="100" src="https://gist.githubusercontent.com/json2d/ffbf9ae39c31a3e1ea1c84277e157f1d/raw/7fa47e68047eb7eaf1bae30eb34b8b5948590c2d/resuspend-final.svg" alt='Resuspend Logo'></a>
</p>

<h1 align="center">Resuspend</h1>
<h3 align="center">highly declarative loading-states unlocked for React components</h3>

<div align="center">

this molecular-{sized | weight} library provides a `<Suspension/>` component that works closely {along} w/ the [`<Suspense/>` component from the React API](https://react.dev/reference/react/Suspense) to make implementing organically evolving loading-states super declarative and basic 🚀

[![npm](https://img.shields.io/npm/v/resuspend.svg)](https://www.npmjs.com/package/resuspend)
![node](https://img.shields.io/node/v/resuspend.svg)
![license](https://img.shields.io/npm/l/resuspend.svg)
![downloads](https://img.shields.io/npm/dt/resuspend.svg)
![Travis](https://img.shields.io/travis/json2d/resuspend.svg)

<!-- ![Coveralls github](https://img.shields.io/coveralls/github/json2d/resuspend.svg) -->
</div>

# Getting started

Install the latest version:

```bash
npm i resuspend -S
# or
yarn add resuspend
```

Then import:

```js
import { Suspension } from "resuspend";
```

Now we're ready to use it with some `<Suspense>` components. 🏄🏽‍♂️🌊

## Requirements
- React 16.8+
  

# Basic usage

Unassumingly {user-friendly}, the [`<Suspension>` component](/docs/api-reference/Suspension) unlocks for us a strongly declarative approach for managing loading states in React components.

In practice, the basic implementation pattern involves using it to control `<Suspense>` components using standard hooks such as `useState` and `useEffect`. 🚀

## Demo

Let's consider the simple example of a `<DramaticHello>` component that shows a loading-state for 3 seconds ⏱ before finally revealing a friendly greeting message:

### Implementation

As mentioned, we can control the `<Suspense>` component using the `<Suspension>` component and the standard `useState` and `useEffect` hooks to describe when the greeting should be revealed:

```jsx
import { Suspense, useState, useEffect } from "react";
import { Suspension } from "resuspend";

function DramaticHello(props) {
  const [revealed, setRevealed] = useState(false);

  // reveal greeting (w some pacing)
  useEffect(() => {
    if (!revealed) setTimeout(() => setRevealed(true), 3000);
  }, [revealed]);

  return (
    <Suspense fallback={<>[pausing dramatically...]</>}>
      <Suspension active={!revealed}>hello world! 👋🏽🌎</Suspension>
    </Suspense>
  );
}
```

[try it out in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-lurxwz?file=/src/DramaticPause.jsx)

### Key details

A few of things to note about what's happening in the component above:

- the `revealed` state is used by the [`<Suspension>` component `active` prop](/docs/api-reference/Suspension#active) to declare whether the suspension state should be _active_ or _inactive_
- the effect switches the `revealed` state, controlling the suspension state dynamically

> This kind of **"dynamic switch"** is all that's needed to drive a loading-state 🏎 - it can be a state controlled by an effect, or even a prop controlled by a parent component. The state could also come from a hook, or even some combination of all of the above!

## Examples

- [`<DramaticHelloer>`](/docs/examples/DramaticHelloer)


# Integration

Integrating with functionality from other React libraries is simple due to the basic nature of this library. Doing this can be a great way to combine useful abstractions from different sources to develop rich loading-states. ✨

For this, the basic implementation pattern remains principally the same: control `<Suspense>` components using `<Suspension>` components and hooks to articulate loading-state behaviors. It's just a shift towards making use of a wider, more adhoc variety of hooks available from the [many libraries and frameworks in the React ecosystem](https://www.npmjs.com/search?q=keywords%3Areact%20hook) to serve that same purpose (in ideally a more elegant manner!)

> Custom hooks themselves are just built on top of standard hooks, which is why in principle they work just the same in this context.

## Demo

Let's consider the example of a `<PatientSnakeGame>` component that shows a loading-state when the snake game is out of view:

### Implementation

To build this we can use [react-intersection-observer]("https://github.com/thebuilder/react-intersection-observer") to do the adhoc part of the lift and simply use the `inView` state that their `useInView` hook provides to conveniently declare when our snake game should be revealed (and conversely when it should be [paused in the background](/docs/examples/PatientSnakeGame#background)):

```jsx
import { useInView } from "react-intersection-observer";

function PatientSnakeGame(props) {
  const { ref, inView } = useInView({ threshold: 1 }); // all in
  return (
    <div ref={ref}>
      <Suspense fallback={<>[waiting for 🖼 to be fully in view]</>}>
        <Suspension active={!inView}>
          <SnakeGame />
        </Suspension>
      </Suspense>
    </div>
  );
}
```

[try it out in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-lurxwz?file=/src/DramaticPause.jsx)

### Key details

A few of things to note about what's happening in the component above:

- the `inView` state is used by the `<Suspension>` component `active` prop to declare the suspension state
- the `<SnakeGame>` component is paused when it is out of view, and continues when it is back in view

> The `<Suspense>` component in fallback mode keeps its child components mounted, but puts them in a frozen or suspended state ❄️ so in this example we don't lose any progress in the game or miss any of the action!

## Examples

- [`<PatientSnakeGame>`](/docs/examples/PatientSnakeGame)
- [`<PlantedDashboard>`](/docs/examples/PlantedDashboard)


# Data fetching

Often, we'll want to have a loading-state while fetching some data needed to render a component. With this library we can unlock `<Suspense>`-enabled data fetching without being dependent on an opinionated framework {(like eg. NextJS)}.

To be sure, how to fetch data is entirely up to you - this library remains unopinionated on the matter and doesn't favor any specific method.

## Standard

For starters, we can perform a typical async fetch and use the availability of the data to declare the when to reveal the dashboard (and conversely when to show the loading-state):

```jsx
export function PlantedDashboard(props) {
  const [plants, setPlants] = useState();

  useEffect(() => {
    const fetchPlants = async () => {
      const response = await fetch("/api/plants/");
      return response.json();
    };

    fetchPlants().then(setPlants);
  }, []);

  const [id, setId] = useState();
  useEffect(() => setId(plants?.[0].id), [plants]);

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants || !id}>
        <PlantsController plants={plants} id={id} onIdChanged={setId} />
        <PlantProfile id={id} />
      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

#### Key details

A few of things to note about what's happening in the component above:

- the `plants` and `id` states are used by the `<Suspension>` component `active` prop to declare the suspension state
- the effects fetch the `plants` state and set the `id` state to that of the first plant in the `plants` state, controlling the suspension state dynamically

## Caching

The more savvy and efficient way to do data-fetching, in general, is by using a caching strategy like [`stale-while-revalidate`](https://datatracker.ietf.org/doc/html/rfc5861).

To implement this we can have [the `useSWR` hook from SWR](https://swr.vercel.app/) perform the fetch and simply continue to use the availability of the data to declare when to reveal the dashboard (and conversely when to show the loading-state):

```jsx
import useSWR from "swr";

function PlantedDashboard(props) {
  const { data: plants } = useSWR("/api/plants", fetcher); // caches ✨

  const [id, setId] = useState(plants?.[0].id);
  useEffect(() => setId(plants?.[0].id), [plants]);

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants || !id}>
        <PlantsController plants={plants} id={id} onIdChanged={setId} />
        <PlantProfile id={id} />
      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

#### Key details

A few of things to note about what's happening in the component above:

- the `plants` and `id` states are used by the `<Suspension>` component `active` prop to declare the suspension state
- the `useSWR` hook fetches the `plants` state and the effect sets the `id` state to that of the first plant in the `plants` state, controlling the suspension state dynamically
- the `id` state is also set initially to that of the first plant in the `plants` state, which will also be set initially when the `/api/plants` data was cached prior.

> Compared to the [previous example](/docs/getting-started/data-fetching#standard), nothing was actually changed in the JSX that was rendered, just the method of fetching used in the component body! 🚀

## Examples

- [`<PlantedDashboard>`](/docs/examples/PlantedDashboard)

# Structuring

Whether it's eager loading, lazy loading, or somewhere-in-between loading, we can experimentally nest and compose to find the sweet spot for our app much more easily w/ very minimal code changes.

More critically, we've unlocked the power to coherently describe [arbitrarily complex loading strategies](/docs/getting-started/concepts#loading-strategies) within a single component! 🎉

## Composition

Building upon the [previous data-fetching example](/docs/getting-started/data-fetching/#caching), we can start to explore how to compose these various loading strategies with a set of `<Suspense>` components controlled by `<Suspension>` components.

### Eager loading

Now, let's see an example where we compose loading-states to implement eager loading, making rendering occur as soon as each element is ready:

```jsx
function PlantProfile(props) {
  const { id } = props;

  const { data: metrics } = useSWR(id && `/api/plants/${id}/metrics`, fetcher);
  const { data: trend } = useSWR(id && `/api/plants/${id}/trend`, fetcher);

  return (
    <>
      <Suspense fallback={<MetricsSkeleton />}>
        <Suspension active={!metrics}>
          <Metrics data={metrics} />
        </Suspension>
      </Suspense>

      <Suspense fallback={<TrendSkeleton />}>
        <Suspension active={!trend}>
          <Trend data={trend} />
        </Suspension>
      </Suspense>
    </>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

#### Key details

A few of things to note about what's happening in the component above:

- the `metrics` and `trend` states are _each_ used by _separate_ `<Suspension>` components `active` prop to declare the _separate_ suspension states
- the `metrics` and `trend` states get fetched in parallel (when the `id` prop is set or updated)
- the `<MetricsSkeleton>` component is rendered while the `metrics` state is getting fetched
- the `<Metrics>` component is rendered when the `metrics` state is fetched
- the `<TrendSkeleton>` component is rendered while the `trend` state is getting fetched
- the `<Trend>` component is rendered when then `trend` state is fetched

### Lazy loading

Now, let's see an example where we compose loading-states to implement lazy loading, making rendering only occurs when all elements are ready:

To begin, let's consolidate skeleton screens into a unified component:

```jsx
function PlantProfileSkeleton() {
  return (
    <>
      <MetricsSkeleton />
      <TrendSkeleton />
    </>
  );
}
```

Next, we can remix the [previous composition](/docs/getting-started/structuring#eager-loading) of the `<Suspense>` and `<Suspension>` components to reflect this lazier behavior:

```jsx
function PlantProfile(props) {
  const { id } = props;

  const { data: metrics } = useSWR(id && `/api/plants/${id}/metrics`, fetcher);
  const { data: trend } = useSWR(id && `/api/plants/${id}/trend`, fetcher);

  return (
    <Suspense fallback={<PlantProfileSkeleton />}>
      <Suspension active={!metrics || !trend}>
        <Metrics data={metrics} />
        <Trend data={trend} />
      </Suspension>
    </Suspense>
  );
}
```

#### Key details

A few of things to note about what's happening in the component above:

- the `metrics` and `trend` states are used by the `<Suspension>` component `active` prop to declare the suspension state
- the `metrics` and `trend` states get fetched in parallel (still)
- the `<PlantProfileSkeleton>` component is rendered while _either or both_ `metrics` and `trend` states are getting fetched
- the `<Metrics>` and `<Trend>` components are rendered together when _both_ the `metrics` and `trend` states are fetched

> Compared to the [previous example](/docs/getting-started/structuring#eager-loading), nothing was actually changed in the component body, just the JSX that was rendered! 🚀

## Nesting

Imagine now we begin to think that having the `<PlantProfile>` component is a bit too much abstraction, since we only ever use it within the [`<PlantedDashboard>` component](/docs/getting-started/data-fetching#caching).

To reduce the abstraction the right amount we can gather all the loading-states and see them together as one clear loading strategy. We have the freedom to nest, compose, and handle it all within a single component:

```jsx
function PlantedDashboard(props) {
  const { data: plants } = useSWR("/api/plants", fetcher);

  const [id, setId] = useState(plants?.[0].id);
  useEffect(() => setId(plants?.[0].id), [plants]);

  const { data: metrics } = useSWR(id && `/api/plants/${id}/metrics`, fetcher);
  const { data: trend } = useSWR(id && `/api/plants/${id}/trend`, fetcher);

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants || !id}>
        <PlantsController plants={plants} id={id} onIdChanged={setId} />
        <Suspense fallback={<PlantProfileSkeleton />}>
          <Suspension active={!metrics || !trend}>
            <Metrics data={metrics} />
            <Trend data={trend} />
          </Suspension>
        </Suspense>
      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

### Key details

A few of things to note about what's happening in the component above:

- the `plants` and `id` states are used by the `<Suspension>` component `active` prop to declare the _top-level_ suspension state
- the `metrics` and `trend` states are used by the `<Suspension>` component `active` prop to declare the _nested_ suspension state
- the `metrics` and `trend` states do not get fetched until the `plants` state is fetched and `id` state is set to that of the first plant from the `plants` state
- the `<PlantsController>` and `<PlantProfileSkeleton>` components are rendered together when the `plants` state is fetched but while _either or both_ the `metrics` and `trend` states are getting fetched
- the `<Metrics>` and `<Trend>` components are rendered together when _both_ the `metrics` and `trend` states are fetched

> For broader scopes of user interfaces, like pages, containing all the loading-states within a single component can make the overall loading strategy read more cohesively and easier to grok. 🔭

## Examples

- [`<PlantedDashboard>`](/docs/examples/PlantedDashboard)

# SSR compatible
While usage in SSR (server-side rendering) has yet to-be fully explored, the `<Suspension>` component is useable w/ SSR frameworks that let us force CSR somehow [eg. w/ Next.js using its dynamic imports ✨](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr)

```jsx
// pages/index.js
import dynamic from "next/dynamic";

import { DramaticHelloerLoading } from "../components/DramaticHelloer";

// dynamic import
const DramaticHelloer = dynamic(() => import("../components/DramaticHelloer"), {
  ssr: false, // forces CSR
  loading: () => <DramaticHelloerLoading />, // does minimal SSR here
});

export default function IndexPage() {
  return (
    <main>
      <DramaticHelloer />
    </main>
  );
}

```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/p/sandbox/next12-pages-dynamic-imports-x-resuspend-mn696q?file=%2Fpages%2Findex.js%3A5%2C1-9%2C1)

## {more integrations | integration guides}

- [`next`]()
- [`swr`]()
- [`redux`]()
- [`react-intersection-observer`]()
- [`react-revelation`]() (transitions)
- [`<TransitionGroup>`]()

[recommendations?](link-to-issues-or-discustions)

## feedback

[bbb link to RFC asking for feedback]
