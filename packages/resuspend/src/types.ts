import React from 'react';

export type Maybe<T> = void | T | null;

export type Condition = boolean | (() => boolean);

// // copied from React since they don't export it
// declare const UNDEFINED_VOID_ONLY: unique symbol;
// // Destructors are only allowed to return void.
export type Destructor = () => void; //| { [UNDEFINED_VOID_ONLY]: never };

export type DestructorRef = React.MutableRefObject<Maybe<Destructor>>;

export type DestructorRegistrator = (cleanup: Maybe<Destructor>) => void;

export type InvertedEffectCallback = (
  registerCleanup: DestructorRegistrator
) => void;

export type ImmediateEffectCallback =
  | React.EffectCallback
  | InvertedEffectCallback;
