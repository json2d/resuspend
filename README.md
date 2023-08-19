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

## getting started

install the latest version:

```sh
npm i resuspend -S
```

import it:

```js
import { Suspension } from 'resuspend';
```

## basic usage

here's a simple example of a `<DramaticHelloer>` component that uses a loading-state to repeat a greeting every 6 seconds:

```jsx
import { Suspense, useState, useEffect } from 'react';
import { Suspension } from 'resuspend';

function DramaticHelloer(props) {
  const [revealed, setRevealed] = useState(false);

  // reveal or unreveal greeting repeatedly (w/ some pacing)
  useEffect(
    function revevalOrUnreveal() {
      if (!revealed) setTimeout(() => setRevealed(true), 3000);
      else setTimeout(() => setRevealed(false), 3000);
    },
    [revealed]
  );

  return (
    <Suspense fallback={<>[pausing dramatically...]</>}>
      <Suspension active={!revealed}>hello world! 👋🏽🌎</Suspension>
    </Suspense>
  );
}
```

[try it out in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-basic-example-lurxwz?file=/src/DramaticPause.jsx)

### key details

a few of things {to note} about {what's happening in} the component above:

- the `revealed` state is used by the `<Suspension>` component `active` prop to declare whether the suspension state should be _active_ or _inactive_

- the `revealed` state is switched by `revevalOrUnreveal` effect, controlling the suspension state dynamically

> this kind of "dynamic switch" is all that's needed to drive a loading-state 🏗 - they can be a state controlled by an effect, or even a prop controlled by a parent component. the state could also come from a hook, or even some combination of all of the above!

## {integration example | basic integration}

one of more obscure things the `<Suspense>` component was designed for is to readily pause our components, like when they are out of view, so they don't keep running in the background if we don't want them to.

{for this example | to best demonstrate this} we can use `react-intersection-observer` to do part of the lift and simply {use the `inView` state that their hook conveniently provides to declare the suspension state | {utilize | leverage} their friendly `useInView` hook to make it basic}:

```jsx
import { Suspension } from 'resuspend';
import { SnakeGame } from 'resnake';
import { useInView } from 'react-intersection-observer';

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

### key details

[bbb a few things]

- the `inView` state is used by the `<Suspension>` component `active` prop to declare the suspension state

- the `<SnakeGame>` component is paused when it is out of view, and continues when it is back in view

> the `<Suspense>` component {in fallback mode} keeps its children components mounted, but puts them in a {frozen | suspended} state ❄️ so we don't lose our progress in the game or miss any of the action!

## {data fetching example | basic data-fetching}

Often, we'll want to wait until data is fetched before showing a component.

To handle this, we can use the availability of the fetched data to decide if the component should be suspended or not:

```jsx
import { Suspense, useState, useEffect } from 'react';
import { Suspension } from 'resuspend';

export function PlantedDashboard(props) {
  const [plants, setPlants] = useState();

  const [id, setId] = useState(plants?.[0].id);

  useEffect(
    async function fetchAndSetPlants() {
      if (!plants) {
        const response = await fetch(`/api/plants/`)
        const data = response.json();

        setPlants(data.plants);
        setId(data.plants?.[0].id);
      }
    },
    [plants]
  );

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants}>
        <Controller plants={plants} onIdChanged={setId}/>
        <PlantedProfile id={id}>
      </Suspension>
    </Suspense>
  );
}
```

### caching

A {smart | great | efficient} way to do data-fetching, in general, is by using a strategy like [SWR for caching](https://swr.vercel.app/):

```jsx
import { Suspension } from 'resuspend';
import useSWR from "swr";

function PlantedDashboard(props) {
  const { data: plants } = useSWR("/api/plants", fetcher);

  const [id, setId] = useState(plants?.[0].id);
  useEffect(() => setId(plants?.[0].id), [plants])

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants}>
        <Controller plants={plants} onIdChanged={setId}/>
        <PlantedProfile id={id}>
      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

### composing

Now, let's see an example where composition is used to implement eager loading:

```jsx
function PlantedProfile(props) {
  const { id } = props;

  const { data: metrics } = useSWR(id && `/api/plants/${id}/metrics`, fetcher);
  const { data: trend } = useSWR(id && `/api/plants/${id}/trend`, fetcher);

  return (
    <Suspense fallback={<PlantedProfileSkeleton />}>
      <Suspension active={!metrics}>
        <Metrics data={metrics} />
      </Suspension>
      <Suspension active={!trend}>
        <Trend data={trend} />
      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

### nesting

Imagine now we think the abstraction is a bit too much. let's gather all the loading-states and see them as one clear loading strategy. we have the freedom to nest, compose, and handle it all within a single component:

```jsx
function PlantedDashboard(props) {
  const { data: plants } = useSWR("/api/plants", fetcher);

  const [id, setId] = useState(plants?.[0].id);
  useEffect(() => setId(plants?.[0].id), [plants])

  const { data: metrics } = useSWR(id && `/api/plants/${id}/metrics`, fetcher);
  const { data: trend } = useSWR(id &&`/api/plants/${id}/trend`, fetcher);

  return (
    <Suspense fallback={<PlantsLoading />}>
      <Suspension active={!plants}>
        <Controller plants={plants} onIdChanged={setId}/>

        <Suspense fallback={<PlantedProfileSkeleton>}>
          <Suspension active={!metrics}>
            <Metrics data={metrics} />
          </Suspension>
          <Suspension active={!trend}>
            <Trend data={trend} />
          </Suspension>
        </Suspense>

      </Suspension>
    </Suspense>
  );
}
```

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

## SSR compatible

While usage in SSR (server-side rendering) has yet to-be fully explored, the `<Suspension>` component is perfectly useable w/ SSR frameworks that let us force CSR somehow [eg. w/ Next.js using its dynamic imports ✨](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr)

```jsx
// pages/index.js
import dynamic from 'next/dynamic';

import { DramaticHelloerLoading } from '../components/DramaticHelloer';

// dynamic import
const DramaticHelloer = dynamic(() => import('../components/DramaticHelloer'), {
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

[try it out now in a live editor via CodeSandbox ✨](https://codesandbox.io/s/resuspend-data-fetching-example-quote-of-the-day-zlbpjm?file=/src/QuoteOfTheDay.jsx)

## lifecycle

the `<Suspension/>` component may be _activated_, _deactivated_, then _reactivated_ and _deactivated_ again, and so on until it's unmounted.

## live demos

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
