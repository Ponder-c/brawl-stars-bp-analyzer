import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('brawlBp', {
  platform: process.platform
});
