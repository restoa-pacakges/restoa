import { useEffect, useState } from 'react';

export interface GetValueHook<T> {
  (value: T, key: string): T;
}

export interface SetValueHook<T> {
  (value: T, key: string): T;
}

export interface SetValueCallback<T> {
  (value: T, key: string): void;
}

interface OnValue {
  (): void;
}

export interface Option<T> {
  key?: string;
  getValueHook?: GetValueHook<T>;
  setValueHook?: SetValueHook<T>;
  setValueCallback?: SetValueCallback<T>;
}

interface UseValue<T> {
  (): T;
}

export interface SetValueAction<T> {
  (currentValue: T): T;
}

interface SetValue<T> {
  (next: T | SetValueAction<T>): void;
}

interface GetValue<T> {
  (): T;
}

export interface LazyIntializedValue<T> {
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

function isLazyIntializedValue<T>(
  next: T | LazyIntializedValue<T>,
): next is LazyIntializedValue<T> {
  if (typeof next === 'function') {
    return true;
  }
  return false;
}

export function createStore<T>(
  initialValue: T | LazyIntializedValue<T>,
  option?: Option<T>,
): [UseValue<T>, SetValue<T>, GetValue<T>] {
  function getIntializedValue() {
    if (isLazyIntializedValue(initialValue)) {
      return initialValue();
    } else {
      return initialValue;
    }
  }

  const key = option?.key || `store-${Math.random()}`;
  const getValueHook = option?.getValueHook;
  const setValueHook = option?.setValueHook;
  let value: T | undefined;

  const onValueSet: Set<OnValue> = new Set();

  function setValue(next?: T | SetValueAction<T>) {
    if (next === undefined) {
      value = undefined;
      onValueSet.forEach(onValue => onValue());
    } else {
      let nextValue = value;
      if (isSetValueAction(next)) {
        nextValue = next(value || getIntializedValue());
      } else {
        nextValue = next;
      }
      if (setValueHook !== undefined) {
        nextValue = setValueHook(nextValue, key);
      }
      value = nextValue;
      onValueSet.forEach(onValue => onValue());
    }
    if (option?.setValueCallback !== undefined) {
      option.setValueCallback(value || getIntializedValue(), key);
    }
  }

  function getValue() {
    const nextValue =
      getValueHook !== undefined
        ? getValueHook(value || getIntializedValue(), key)
        : value || getIntializedValue();
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
    const [state, setState] = useState<T>(value || getIntializedValue());

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
