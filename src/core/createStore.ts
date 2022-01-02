import { useEffect, useState } from 'react';
import {
  getBehavior,
  GetValueHook,
  SetValueCallback,
  SetValueHook,
} from './createBehavior';

export interface Log {
  text: string;
}
export interface Information {
  key: string;
  transactionId: number;
  activated: boolean;
  updated: Date | null;
  log: Log | null;
}
export interface OnValue {
  (): void;
}

export interface Option<T> {
  key?: string;
  getValueHook?: GetValueHook<T>;
  setValueHook?: SetValueHook<T>;
  setValueCallback?: SetValueCallback<T>;
}

export interface UseValue<T> {
  (): T;
}

export interface SetValueAction<T> {
  (currentValue: T): T;
}

export interface SetValue<T> {
  (next: T | SetValueAction<T>): void;
}

export interface GetValue<T> {
  (): T;
}

export interface LazyInitializedValue<T> {
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

function isLazyInitializedValue<T>(
  next: T | LazyInitializedValue<T>,
): next is LazyInitializedValue<T> {
  if (typeof next === 'function') {
    return true;
  }
  return false;
}

export function createStore<T>(
  initialValue: T | LazyInitializedValue<T>,
  option?: Option<T>,
): [UseValue<T>, SetValue<T>, GetValue<T>] {
  function logTransaction(log?: string) {
    information.updated = new Date();
    information.transactionId++;
    if (log !== undefined) {
      information.log = {
        text: log,
      };
    } else {
      information.log = null;
    }
  }

  function getIntializedValue() {
    const next = isLazyInitializedValue(initialValue)
      ? initialValue()
      : initialValue;
    logTransaction('Initialize');
    return next;
  }

  const key = option?.key || `store-${Math.random()}`;
  const getValueHook = option?.getValueHook;
  const setValueHook = option?.setValueHook;
  let activatedHookIds: string[] = [];
  let value: T | undefined;

  const information: Information = {
    key,
    transactionId: 0,
    activated: false,
    updated: null,
    log: null,
  };

  const onValueSet: Set<OnValue> = new Set();

  function setValue(next?: T | SetValueAction<T>) {
    const behavior = getBehavior<T>(key);
    if (next === undefined) {
      value = undefined;
      logTransaction();
      onValueSet.forEach(onValue => onValue());
    } else {
      let nextValue = value;
      if (isSetValueAction(next)) {
        nextValue = next(value || getIntializedValue());
      } else {
        nextValue = next;
      }
      nextValue = behavior.setValueHook(nextValue);
      if (setValueHook !== undefined) {
        nextValue = setValueHook(nextValue, key);
      }
      value = nextValue;
      logTransaction();
      onValueSet.forEach(onValue => onValue());
    }
    if (option?.setValueCallback !== undefined) {
      option.setValueCallback(value || getIntializedValue(), key);
    }
    behavior.setValueCallback(value || getIntializedValue());
  }

  function getValue() {
    const behavior = getBehavior<T>(key);
    let nextValue = value || getIntializedValue();
    nextValue = behavior.getValueHook(nextValue);
    if (getValueHook !== undefined) {
      nextValue = getValueHook(nextValue, key);
    }
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

  function useValue(hookId: string = `hook-${Math.random}`) {
    const [state, setState] = useState<T>(value || getIntializedValue());

    useEffect(() => {
      function onValue() {
        const nextState = getValue();
        setState(nextState);
      }
      const unsubscribe = subscribe(onValue);
      return unsubscribe;
    }, []);

    useEffect(() => {
      activatedHookIds.push(hookId);
      information.activated = true;
      return () => {
        if (activatedHookIds.includes(hookId)) {
          activatedHookIds = activatedHookIds.filter(c => c !== hookId);
        }
        information.activated = activatedHookIds.length > 0;
      };
    }, [hookId]);

    return state;
  }

  return [useValue, setValue, getValue];
}
