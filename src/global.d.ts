import { Information } from './core/createStore';

declare global {
  interface Window {
    __RESTOA_DEV_TOOLS_WORKER__?: {
      updateInformation: (information: Information, value: any) => void;
    };
  }
}
