import { spawn } from 'child_process';
import { logger } from '../config/logger.js';
import { generateOutputFile } from '../helpers.js';

class VideoProcessing {
  constructor(inputPath) {
    this.ffmpeg = 'ffmpeg';
    this.inputPath = inputPath;
  }

  ExtractAudiofromVideo() {
    if (!this.inputPath) {
      return Promise.reject('Format required input path');
    }
    const outputFile = generateOutputFile(this.inputPath, 'm4a');

    return new Promise((resolve, reject) => {
      const audioData = spawn(this.ffmpeg, [
        '-y',
        '-i',
        this.inputPath,
        '-vn',
        '-acodec',
        'copy',
        outputFile,
      ]);

      let log = '';
      audioData.stderr.on('data', (chunk) => {
        log += chunk.toString();
      });

      audioData.on('close', (code) => {
        if (code == 0) {
          resolve(outputFile);
        } else {
          logger.error(
            `Error Ocured while extracting audio  with code ${code}: ${log}`,
          );
          reject(
            new Error(
              `Error Ocured while extracting audio  with code ${code}: ${log}`,
            ),
          );
        }
      });

      audioData.on('error', (error) => {
        logger.error(
          `Error Ocured while extracting audio  with code ${code}: ${log}`,
        );
        reject(
          new Error(
            `Error Ocured while extracting audio  with code ${code}: ${log}`,
          ),
        );
      });
    });
  }

  ExtractMuteVideo() {
    if (!this.inputPath) {
      return Promise.reject('Format required input path');
    }
    const outputFile = generateOutputFile(this.inputPath);

    return new Promise((resolve, reject) => {
      const audioData = spawn(this.ffmpeg, [
        '-y',
        '-i',
        this.inputPath,
        '-an',
        '-vcodec',
        'copy',
        outputFile,
      ]);

      let log = '';
      audioData.stderr.on('data', (chunk) => {
        log += chunk.toString();
      });

      audioData.on('close', (code) => {
        if (code == 0) {
          resolve(outputFile);
        } else {
          logger.error(
            `Error Ocured while extracting mute video  with code ${code}: ${log}`,
          );
          reject(
            new Error(
              `Error Ocured while extracting mute video  with code ${code}: ${log}`,
            ),
          );
        }
      });

      audioData.on('error', (error) => {
        logger.error(
          `Error Ocured while extracting mute video with code ${code}: ${log}`,
        );
        reject(
          new Error(
            `Error Ocured while extracting mute video with code ${code}: ${log}`,
          ),
        );
      });
    });
  }
}

export { VideoProcessing };
