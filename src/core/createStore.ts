import { useDebugValue, useEffect, useState } from 'react';
import {
  getBehavior,
  GetValueHook,
  SetValueCallback,
  SetValueHook,
  UpdateInformation,
} from './createBehavior';

export interface Log<T> {
  key: string;
  value: T;
  text: string | null;
  transactionId: number;
  updated: Date;
}
export interface Information {
  key: string;
  transactionId: number;
  activated: boolean;
  updated: Date | null;
  log: string | null;
}
export interface OnValue {
  (): void;
}

export interface Option<T> {
  key?: string;
  getValueHook?: GetValueHook<T>;
  setValueHook?: SetValueHook<T>;
  setValueCallback?: SetValueCallback<T>;
  updateInformation?: UpdateInformation<T>;
}

export interface UseValue<T> {
  (hookId?: string): T;
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
  const key = option?.key || `store-${Math.random()}`;
  const getValueHook = option?.getValueHook;
  const setValueHook = option?.setValueHook;
  const updateInformationCallback = option?.updateInformation;
  let activatedHookIds: string[] = [];
  let value: T | undefined;

  let information: Information = {
    key,
    transactionId: 0,
    activated: false,
    updated: null,
    log: null,
  };

  function updateInformation(next: Partial<Information>, log?: string) {
    information = {
      ...information,
      ...next,
      log: log || null,
    };
    const behavior = getBehavior<T>(key);
    behavior.updateInformation(information, value);
    if (updateInformationCallback !== undefined) {
      updateInformationCallback(information, value);
    }
  }

  function getValueOrInitializeValue() {
    const next = value || getInitializedValue();
    if (value !== next) {
      value = next;
      updateInformation(
        {
          transactionId: information.transactionId + 1,
          updated: new Date(),
        },
        'Initialize',
      );
    }
    return next;
  }

  function getInitializedValue() {
    const next = isLazyInitializedValue(initialValue)
      ? initialValue()
      : initialValue;
    return next;
  }

  const onValueSet: Set<OnValue> = new Set();

  function setValueCore(next: T | SetValueAction<T>, log?: string) {
    const behavior = getBehavior<T>(key);
    let nextValue = value;
    if (isSetValueAction(next)) {
      nextValue = next(value || getInitializedValue());
    } else {
      nextValue = next;
    }
    nextValue = behavior.setValueHook(nextValue);
    if (setValueHook !== undefined) {
      nextValue = setValueHook(nextValue, key);
    }
    value = nextValue;
    updateInformation(
      {
        transactionId: information.transactionId + 1,
        updated: new Date(),
      },
      log,
    );
    return nextValue;
  }

  function setValue(next?: T | SetValueAction<T>, log?: string) {
    const nextValue =
      next === undefined
        ? getValueOrInitializeValue()
        : setValueCore(next, log);

    onValueSet.forEach(onValue => onValue());
    if (option?.setValueCallback !== undefined) {
      option.setValueCallback(nextValue, key);
    }
    const behavior = getBehavior<T>(key);
    behavior.setValueCallback(nextValue);
  }

  function getValue() {
    const behavior = getBehavior<T>(key);
    let nextValue = getValueOrInitializeValue();
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

  function useValue(hookId: string = `hook-${Math.random()}`) {
    const [state, setState] = useState<T>(getValueOrInitializeValue);

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
      updateInformation({ activated: true });
      return () => {
        if (activatedHookIds.includes(hookId)) {
          activatedHookIds = activatedHookIds.filter(c => c !== hookId);
        }
        updateInformation({ activated: activatedHookIds.length > 0 });
      };
    }, [hookId]);

    useDebugValue({ hookId, ...information, value: state });

    return state;
  }

  return [useValue, setValue, getValue];
}
