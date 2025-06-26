import { DispenserAddress, MachineActiveStatus, MachineInoperableModal } from '@/interfaces/modal';
import { postData } from '@/services/axiosWrapper/apiService';
import { testMachine } from './expoApiUtils';
import { machineInoperableEndpoint } from './endpoints';

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
    console.log('📧 Notification sent for inoperable machines:', inoperableMachines);
  }
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
export const checkMachinesStatus = async (
  kioskMachines: number[],
  // If we want this to run 'n' times then attempts default value should be 'n-1'
  attempts: number = 4
): Promise<{ success: boolean; inoperableMachines: number[] }> => {
  try {
    console.group(`Machine Status Check - Attempt ${4 - attempts + 1}/5`);
    const apiResponse = await testMachine();
    const testResults = apiResponse.data;
    console.log('Test Results:', testResults);
    // Only check machines that are active according to machineStatus
    const inoperableMachines = kioskMachines.filter((machineId) => {
      const machineTest = testResults.find((result) => result.machine === machineId);
      return !machineTest || machineTest.status !== 'connected';
    });
    console.log(inoperableMachines);

    // If no inoperable machines, check if all are connected
    if (inoperableMachines.length === 0) {
      const allConnected = kioskMachines.every((machineId) =>
        testResults.some((result) => result.machine === machineId && result.status === 'connected')
      );

      if (allConnected) {
        console.log('✅ All machines connected');
        console.groupEnd();
        return { success: true, inoperableMachines: [] };
      }
    }

    // If we have inoperable machines and no more attempts
    if (attempts === 0) {
      console.log('❌ Max attempts reached with inoperable machines:', inoperableMachines);
      console.groupEnd();
      await sendInoperableMachineNotification(inoperableMachines);
      return { success: false, inoperableMachines };
    }

    // Still have attempts left, retry after delay
    console.log(`⏳ Retrying... ${attempts} attempts remaining`);
    console.groupEnd();
    await delay(2000);
    return await checkMachinesStatus(kioskMachines, attempts - 1);
  } catch (error) {
    console.error('Error during machine status check:', error);
    return { success: false, inoperableMachines: [] };
  }
};
