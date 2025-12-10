import { autoUpdater } from 'electron-updater';
import { dailyLogger } from '../services/loggingService/loggingService';
import { LogLevel } from '../../shared/sharedTypes';

export function setupAutoUpdater(): void {
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
      component: 'autoUpdater'
    });
  });

  autoUpdater.on('update-available', (info) => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Update available.',
      component: 'autoUpdater',
      data: JSON.stringify(info)
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'No updates available.',
      component: 'autoUpdater',
      data: JSON.stringify(info)
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Download progress.',
      component: 'autoUpdater',
      data: JSON.stringify(progressObj)
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Update downloaded successfully. Will install on app quit.',
      component: 'autoUpdater'
    });
    // Removed quitAndInstall() - let autoInstallOnAppQuit handle it
  });

  autoUpdater.on('error', (error) => {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Error in auto-updater',
      component: 'autoUpdater',
      data: JSON.stringify(error)
    });
  });

  // ----------------------------
  // START UPDATE CHECK
  // ----------------------------
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'Starting update check...',
    component: 'autoUpdater'
  });

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Failed to check for updates',
      component: 'autoUpdater',
      data: JSON.stringify(err)
    });
  });
}
