import { TestingConfigJsonObject } from '../../../../shared/sharedTypes';

const getTestingConfig = async (): Promise<TestingConfigJsonObject> => {
  return await window.electron.testingConfig;
};
export const testingConfig = await getTestingConfig();
