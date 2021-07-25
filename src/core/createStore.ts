import { useEffect, useState } from 'react';

interface GetValueHook<T> {
  (value: T, key: string): T;
}

interface SetValueHook<T> {
  (value: T, key: string): T;
}

interface OnValue {
  (): void;
}

interface Option<T> {
  key?: string;
  getValueHook?: GetValueHook<T>;
  setValueHook?: SetValueHook<T>;
}

interface UseValue<T> {
  (): T;
}

interface SetValueAction<T> {
  (currentValue: T): T;
}

interface SetValue<T> {
  (next: T | SetValueAction<T>): void;
}

interface GetValue<T> {
  (): T;
}

function isSetValueAction<T>(
  next: T | SetValueAction<T>,
): next is SetValueAction<T> {
  if (typeof next === 'function') {
    return true;
  }
  return false;
}

export function createStore<T>(
  initialValue: T,
  option?: Option<T>,
): [UseValue<T>, SetValue<T>, GetValue<T>] {
  const key = option?.key || `store-${Math.random()}`;
  const getValueHook = option?.getValueHook;
  const setValueHook = option?.setValueHook;
  let value: T = initialValue;

  const onValueSet: Set<OnValue> = new Set();

  function setValue(next: T | SetValueAction<T>) {
    let nextValue = value;
    if (isSetValueAction(next)) {
      nextValue = next(value);
    } else {
      nextValue = next;
    }
    if (setValueHook !== undefined) {
      nextValue = setValueHook(nextValue, key);
    }
    value = nextValue;
    onValueSet.forEach(onValue => onValue());
  }

  function getValue() {
    const nextValue =
      getValueHook !== undefined ? getValueHook(value, key) : value;
    return nextValue;
  }

  function subscribe(onValue: OnValue) {
    onValueSet.add(onValue);
    function unsubscribe() {
      if (onValueSet.has(onValue)) {
        onValueSet.delete(onValue);
      }
    }
    return unsubscribe;
  }

  function useValue() {
    const [state, setState] = useState<T>(value);

    useEffect(() => {
      function onValue() {
        const nextState = getValue();
        setState(nextState);
      }
      const unsubscribe = subscribe(onValue);
      return unsubscribe;
    }, []);

    return state;
  }

  return [useValue, setValue, getValue];
}
