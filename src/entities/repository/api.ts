import { invoke } from "@tauri-apps/api/core";

export type AppInfo = {
  name: string;
  version: string;
};

export function getAppInfo() {
  return invoke<AppInfo>("app_info");
}
