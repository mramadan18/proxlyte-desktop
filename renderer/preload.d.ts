import { AppApi } from '../main/preload'

declare global {
  interface Window {
    api: AppApi & {
      storeGet: (key: string) => Promise<any>;
      storeSet: (key: string, val: any) => Promise<void>;
      storeDelete: (key: string) => Promise<void>;
      setLoginItem: (openAtLogin: boolean) => Promise<void>;
    }
  }
}
