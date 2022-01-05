import { createDevToolsBehavior } from '../core/behaviors/createDevToolsBehavior';

window.__RESTOA_DEV_TOOLS_WORKER__ = {
  updateInformation: function (information, value) {
    console.log('RESTOA_DEV_TOOLS: ', { ...information, value });
  },
};

const [startDevTools] = createDevToolsBehavior();

startDevTools();
