import { useEffect, useState } from 'react';
import { createBehavior } from './createBehavior';
import { OnValue, UseValue } from './createStore';

export interface Query<T> {
  (): T;
}

export interface AsyncQuery<T> {
  (): Promise<T>;
}

export function createQuery<T>(query: Query<T>, keys: string[]): UseValue<T> {
  const onValueSet: Set<OnValue> = new Set();

  function test(key: string) {
    return keys.includes(key);
  }
  function setValueCallback() {
    onValueSet.forEach(onValue => onValue());
  }

  const [startBehavior] = createBehavior(test, { setValueCallback });

  function subscribe(onValue: OnValue) {
    onValueSet.add(onValue);
    function unsubscribe() {
      if (onValueSet.has(onValue)) {
        onValueSet.delete(onValue);
      }
    }
    return unsubscribe;
  }
  function useView() {
    const [state, setState] = useState<T>(query());

    useEffect(() => {
      startBehavior();
      function onValue() {
        setState(query());
      }
      const unsubscribe = subscribe(onValue);
      return unsubscribe;
    }, []);

    return state;
  }

  return useView;
}

export function createAsyncQuery<T>(
  asyncQuery: AsyncQuery<T>,
  keys: string[],
): UseValue<T | undefined> {
  const onValueSet: Set<OnValue> = new Set();

  function test(key: string) {
    return keys.includes(key);
  }
  function setValueCallback() {
    onValueSet.forEach(onValue => onValue());
  }

  const [startBehavior] = createBehavior(test, { setValueCallback });

  function subscribe(onValue: OnValue) {
    onValueSet.add(onValue);
    function unsubscribe() {
      if (onValueSet.has(onValue)) {
        onValueSet.delete(onValue);
      }
    }
    return unsubscribe;
  }
  function useView() {
    const [state, setState] = useState<T>();

    useEffect(() => {
      Promise.resolve(asyncQuery()).then(setState);
      startBehavior();
      function onValue() {
        Promise.resolve(asyncQuery()).then(setState);
      }
      const unsubscribe = subscribe(onValue);
      return unsubscribe;
    }, []);

    return state;
  }

  return useView;
}
