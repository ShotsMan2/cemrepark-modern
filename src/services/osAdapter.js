import logger from "../lib/logger";

export class OSAdapter {
  static isDesktop() {
    if (typeof window !== "undefined") {
      // Check if running inside Electron or Tauri
      return !!window.__TAURI__ || navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;
    }
    return false;
  }

  static async sendNotification(title, body) {
    if (this.isDesktop()) {
      logger.info(`[Desktop OS] Sending Native Notification: ${title}`);
      if (window.__TAURI__) {
        // Tauri Notification API
        // const { sendNotification } = await import('@tauri-apps/api/notification');
        // sendNotification({ title, body });
      } else {
        // Electron Notification API
        new Notification(title, { body });
      }
    } else {
      logger.info(`[Web OS] Web Notification: ${title}`);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    }
  }
}
