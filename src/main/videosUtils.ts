import fs from 'fs';
import config from '../../config.json';
import path from 'path';

const SUPPORTED_FILE_EXTENSIONS = config.supportedVideoFormats || ['.mp4'];
const VIDEO_FILE_PATH = config.videoFilePath || './videos';
export const getVideoFileNames = (): string[] => {
  try {
    const files = fs.readdirSync(VIDEO_FILE_PATH);
    return files.filter((file) =>
      SUPPORTED_FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );
  } catch (error) {
    console.error('Error reading video files:', error);
    return [];
  }
};
