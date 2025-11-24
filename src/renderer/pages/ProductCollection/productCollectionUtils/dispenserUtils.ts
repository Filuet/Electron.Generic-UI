import {
  DispenserAddress,
  LogLevel,
  MachineActiveStatus,
  MachineInoperableModal
} from '@/interfaces/modal';
import { getData, postData } from '@/services/axiosWrapper/apiService';
import { getDispenseStatus, resetStatus, testMachine } from '../../../utils/expoApiUtils';
import {
  machineInoperableEndpoint,
  machineStatusFailNotificationEndpoint
} from '../../../utils/endpoints';
import loggingService from '../../../utils/loggingService';

export const parseDispenserAddress = (message: string): DispenserAddress | null => {
  const addressMatch = message.match(/(\d+)\/(\d+)\/(\d+)/);
  if (!addressMatch) return null;

  return {
    machine: addressMatch[1],
    tray: addressMatch[2],
    belt: addressMatch[3]
  };
};
export const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const sendInoperableMachineNotification = async (
  inoperableMachines: number[]
): Promise<void> => {
  if (inoperableMachines.length > 0) {
    const inoperableMachineRequest: MachineInoperableModal = {
      kioskName: import.meta.env.VITE_KIOSK_NAME,
      machineIds: inoperableMachines
    };
    await postData<MachineInoperableModal, void>(
      machineInoperableEndpoint,
      inoperableMachineRequest
    );
    loggingService.log({
      level: LogLevel.INFO,
      message: 'Inoperable machine notification sent',
      component: 'dispenserUtils.ts',
      data: { inoperableMachines }
    });
  }
};
export const sendMachineStatusCheckFailNotification = async (): Promise<void> => {
  await getData<void>(
    `${machineStatusFailNotificationEndpoint}/${import.meta.env.VITE_KIOSK_NAME}`
  );
};
export const getActiveMachines = (machineStatus: MachineActiveStatus): number[] => {
  if (machineStatus.isFirstMachineActive && machineStatus.isSecondMachineActive) {
    return [1, 2];
  }
  if (machineStatus.isFirstMachineActive) {
    return [1];
  }
  return [2];
};
export const checkDispenserStatus = async (attempts: number = 3): Promise<boolean> => {
  if (attempts === 0) {
    loggingService.log({
      level: LogLevel.ERROR,
      component: 'DispenserUtils',
      message: `Dispenser Status is not as expected after 3 attempts.`,
      data: {}
    });
    try {
      await resetStatus();
      loggingService.log({
        level: LogLevel.INFO,
        component: 'DispenserUtils',
        message: `Reset Status Api called. Expo Status has been reset.`
      });
    } catch (error) {
      loggingService.log({
        level: LogLevel.INFO,
        component: 'DispenserUtils',
        message: `Error while calling Reset Status Api.`,
        data: { error }
      });
    }
    return false;
  }
  try {
    const statusResult = await getDispenseStatus();

    if (
      statusResult.status === 'success' &&
      statusResult.action === 'pending' &&
      statusResult.message === 'Waiting for command'
    ) {
      return true;
    }
  } catch (error) {
    loggingService.log({
      level: LogLevel.ERROR,
      component: 'DispenserUtils',
      message: `Error fetching dispenser status.`,
      data: { error }
    });
    return false;
  }

  await delay(2000);
  return checkDispenserStatus(attempts - 1);
};
export const checkMachinesStatus = async (
  kioskMachines: number[],
  // If we want this to run 'n' times then attempts default value should be 'n'
  attempts: number = 5
): Promise<{ success: boolean; inoperableMachines: number[] }> => {
  try {
    console.group(`Machine Status Check - Attempt ${4 - attempts + 1}/5`);

    const testResults = await testMachine();
    loggingService.log({
      level: LogLevel.INFO,
      message: 'Machine status test results',
      component: 'dispenserUtils.ts',
      data: { testResults }
    });
    // Only check machines that are active according to machineStatus
    const inoperableMachines = kioskMachines.filter((machineId) => {
      const machineTest = testResults.find((result) => result.machine === machineId);
      return !machineTest || machineTest.status !== 'connected';
    });
    // todo log only if inoperable machines found
    loggingService.log({
      level: LogLevel.INFO,
      message: 'Inoperable machines identified',
      component: 'dispenserUtils.ts',
      data: { inoperableMachines }
    });
    // If no inoperable machines, check if all are connected
    if (inoperableMachines.length === 0) {
      const allConnected = kioskMachines.every((machineId) =>
        testResults.some((result) => result.machine === machineId && result.status === 'connected')
      );

      if (allConnected) {
        loggingService.log({
          level: LogLevel.INFO,
          message: 'All machines are operational',
          component: 'dispenserUtils.ts',
          data: { testResults }
        });
        console.groupEnd();
        return { success: true, inoperableMachines: [] };
      }
    }

    // If we have inoperable machines and last attempts
    if (attempts === 1) {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Inoperable machines detected after maximum attempts',
        component: 'dispenserUtils.ts',
        data: { inoperableMachines, testResults }
      });

      loggingService.log({
        level: LogLevel.ERROR,
        component: 'DispenserUtils',
        message: `Test Machine Failed: Max attempts reached while checking machines.`,
        data: { inoperableMachines }
      });
      await sendInoperableMachineNotification(inoperableMachines);
      return { success: false, inoperableMachines };
    }

    loggingService.log({
      level: LogLevel.WARN,
      message: 'Inoperable machines detected, retrying...',
      component: 'dispenserUtils.ts',
      data: { inoperableMachines, attemptsLeft: attempts, testResults }
    });
    console.groupEnd();
    await delay(2000);
    return await checkMachinesStatus(kioskMachines, attempts - 1);
  } catch (error) {
    loggingService.log({
      level: LogLevel.ERROR,
      component: 'DispenserUtils',
      message: `Test Machine api Failed. Exception thrown by expo-extractor.`,
      data: { error }
    });
    await sendMachineStatusCheckFailNotification();
    console.error('Error during machine status check:', error);
    return { success: false, inoperableMachines: [] };
  }
};
