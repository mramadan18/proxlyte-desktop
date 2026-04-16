import { AppApi } from '../main/preload'

declare global {
  interface Window {
    api: AppApi
  }
}
