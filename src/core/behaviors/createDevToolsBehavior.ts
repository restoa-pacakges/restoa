import {
  BehaviorTest,
  createBehavior,
  UpdateInformation,
} from '../createBehavior';

export function createDevToolsBehavior(test?: BehaviorTest) {
  const updateInformation: UpdateInformation<any> = function (
    information,
    value,
  ) {
    if (window.__RESTOA_DEV_TOOLS_WORKER__?.updateInformation !== undefined) {
      window.__RESTOA_DEV_TOOLS_WORKER__.updateInformation(information, value);
    }
  };
  const nextTest = test === undefined ? () => true : test;
  return createBehavior(nextTest, {
    updateInformation,
  });
}
