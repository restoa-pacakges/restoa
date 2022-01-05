import { Information } from './createStore';

export interface BehaviorTest {
  (key: string): boolean;
}

export interface StartBehavior {
  (): void;
}

export interface StopBehavior {
  (): void;
}

export interface OnStartBehavior {
  (): void;
}

export interface OnStopBehavior {
  (): void;
}

export interface GetValueHook<T> {
  (value: T, key: string): T;
}

export interface SetValueHook<T> {
  (value: T, key: string): T;
}

export interface SetValueCallback<T> {
  (value: T, key: string): void;
}

export interface UpdateInformation<T> {
  (information: Information, value?: T): void;
}

export interface Behavior {
  getValueHook?: GetValueHook<any>;
  setValueHook?: SetValueHook<any>;
  setValueCallback?: SetValueCallback<any>;
  updateInformation?: UpdateInformation<any>;
}

export interface CreateBehavior {
  (test: BehaviorTest, behavior: Behavior): [StartBehavior, StopBehavior];
}

export interface GetBehavior<T> {
  (key: string): {
    getValueHook: GetValueHook<T>;
    setValueHook: SetValueHook<T>;
    setValueCallback: SetValueCallback<T>;
    updateInformation: UpdateInformation<T>;
  };
}

export interface BehaviorWithTest<T> {
  test: BehaviorTest;
  behavior: T;
}

function createGetValueHook<T>(
  key: string,
  getValueHookArray: BehaviorWithTest<GetValueHook<any>>[],
) {
  return (value: T) => {
    let next = value;
    getValueHookArray.forEach(({ test, behavior }) => {
      if (test(key)) {
        next = behavior(next, key);
      }
    });
    return next;
  };
}

function createSetValueHook<T>(
  key: string,
  setValueHookArray: BehaviorWithTest<SetValueHook<any>>[],
) {
  return (value: T) => {
    let next = value;
    setValueHookArray.forEach(({ test, behavior }) => {
      if (test(key)) {
        next = behavior(next, key);
      }
    });
    return next;
  };
}

function createSetValueCallback<T>(
  key: string,
  setValueCallbackArray: BehaviorWithTest<SetValueCallback<any>>[],
) {
  return (value: T) => {
    setValueCallbackArray.forEach(({ test, behavior }) => {
      if (test(key)) {
        behavior(value, key);
      }
    });
  };
}

function createUpdateInformation<T>(
  key: string,
  updateInformationArray: BehaviorWithTest<UpdateInformation<any>>[],
) {
  return (information: Information, value?: T) => {
    updateInformationArray.forEach(({ test, behavior }) => {
      if (test(key)) {
        behavior(information, value);
      }
    });
  };
}

function createBehaviorStore() {
  const getValueHookArray: BehaviorWithTest<GetValueHook<any>>[] = [];
  const setValueHookArray: BehaviorWithTest<SetValueHook<any>>[] = [];
  const setValueCallbackArray: BehaviorWithTest<SetValueCallback<any>>[] = [];
  const updateInformationArray: BehaviorWithTest<UpdateInformation<any>>[] = [];

  function getBehavior<T>(key: string) {
    return {
      getValueHook: createGetValueHook<T>(key, getValueHookArray),
      setValueHook: createSetValueHook<T>(key, setValueHookArray),
      setValueCallback: createSetValueCallback<T>(key, setValueCallbackArray),
      updateInformation: createUpdateInformation<T>(
        key,
        updateInformationArray,
      ),
    };
  }

  function createBehavior(
    test: BehaviorTest,
    behavior: Behavior,
  ): [StartBehavior, StopBehavior] {
    let isAlive = false;
    const nextTest = function (key: string) {
      if (isAlive) {
        return test(key);
      }
      return false;
    };
    if (behavior.getValueHook !== undefined) {
      getValueHookArray.push({
        test: nextTest,
        behavior: behavior.getValueHook,
      });
    }
    if (behavior.setValueHook !== undefined) {
      setValueHookArray.push({
        test: nextTest,
        behavior: behavior.setValueHook,
      });
    }
    if (behavior.setValueCallback !== undefined) {
      setValueCallbackArray.push({
        test: nextTest,
        behavior: behavior.setValueCallback,
      });
    }
    if (behavior.updateInformation !== undefined) {
      updateInformationArray.push({
        test: nextTest,
        behavior: behavior.updateInformation,
      });
    }

    function startBehavior() {
      isAlive = true;
    }
    function stopBehavior() {
      isAlive = false;
    }
    return [startBehavior, stopBehavior];
  }

  return { getBehavior, createBehavior };
}

const { getBehavior, createBehavior } = createBehaviorStore();

export { getBehavior, createBehavior };
