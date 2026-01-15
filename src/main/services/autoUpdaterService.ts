import { autoUpdater } from 'electron-updater';
import { dailyLogger } from './loggingService/loggingService';
import { LogLevel } from '../../shared/sharedTypes';

export function setupAutoUpdater(): void {
  const COMPONENT_NAME = 'updateService.ts';
  const MAIN_COMPONENT_NAME = 'main.ts';
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'Initializing auto-updater...',
    component: MAIN_COMPONENT_NAME
  });
  // ----------------------------
  // AUTO-UPDATER CONFIGURATION
  // ----------------------------
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Filuet',
    repo: 'Electron.Generic-UI'
  });

  // ----------------------------
  // AUTO-UPDATER EVENT HANDLERS (Register BEFORE checking)
  // ----------------------------
  autoUpdater.on('checking-for-update', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Checking for update...',
      component: COMPONENT_NAME
    });
  });

  autoUpdater.on('update-available', (info) => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Update available.',
      component: COMPONENT_NAME,
      data: JSON.stringify(info)
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'No updates available.',
      component: COMPONENT_NAME,
      data: JSON.stringify(info)
    });
  });

  autoUpdater.on('download-progress', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Downloading updates...',
      component: COMPONENT_NAME
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Update downloaded successfully. Will install on app quit.',
      component: COMPONENT_NAME
    });
  });

  autoUpdater.on('error', (error) => {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Error in auto-updater',
      component: COMPONENT_NAME,
      data: JSON.stringify(error)
    });
  });

  // ----------------------------
  // START UPDATE CHECK
  // ----------------------------
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'Starting update check...',
    component: COMPONENT_NAME
  });

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Failed to check for updates',
      component: COMPONENT_NAME,
      data: JSON.stringify(err)
    });
  });
}
