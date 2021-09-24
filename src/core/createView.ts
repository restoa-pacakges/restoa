import { useEffect, useState } from 'react';
import { createBehavior, UseValue } from '..';
import { OnValue } from './createStore';

export interface GetView<T> {
  (): T;
}

export function createView<T>(
  getView: GetView<T>,
  keys: string[],
): UseValue<T> {
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
    const [state, setState] = useState<T>(getView());

    useEffect(() => {
      startBehavior();
      function onValue() {
        const nextState = getView();
        setState(nextState);
      }
      const unsubscribe = subscribe(onValue);
      return unsubscribe;
    }, []);

    return state;
  }

  return useView;
}
