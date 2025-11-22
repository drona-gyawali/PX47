import { spawn } from 'child_process';
import { getFileExt, generateOutputFile, ignoreExt } from '../helpers.js';
import {
  CODEC,
  SAMPLERATE,
  BITRATE,
  CHANNELS,
  BIT,
  PPS,
} from '../config/constants.js';
import { logger } from '../config/logger.js';

class AudioProcessing {
  constructor(inputPath) {
    this.ffmpeg = 'ffmpeg';
    this.ffprobe = 'ffprobe';
    this.audiowaveform = 'audiowaveform';
    this.inputPath = inputPath;
  }

  ConvertToMp3() {
    if (!this.inputPath)
      return Promise.reject(new Error('Input path is required'));
    const outputPath = generateOutputFile(this.inputPath, 'mp3');
    if (getFileExt(this.inputPath) === 'mp3')
      return Promise.resolve(outputPath);
    if (ignoreExt(this.inputPath))
      return Promise.reject(
        new Error('Input path extension is not supported.'),
      );
    return new Promise((resolve, reject) => {
      const mp3Conversion = spawn(this.ffmpeg, [
        '-i',
        this.inputPath,
        '-ac',
        CHANNELS.toString(),
        '-b:a',
        BITRATE,
        '-ar',
        SAMPLERATE.toString(),
        '-codec:a',
        CODEC,
        outputPath,
      ]);

      let log = '';

      mp3Conversion.stderr.on('data', (chunk) => {
        log += chunk.toString();
        logger.debug('FFmpeg log chunk:', chunk.toString());
      });

      mp3Conversion.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          logger.error(`FFmpeg exited with code ${code}\nLogs: ${log}`);
          reject(new Error(`FFmpeg exited with code ${code}\nLogs: ${log}`));
        }
      });

      mp3Conversion.on('error', (err) => {
        logger.error(`Failed to start FFmpeg: ${err.message}`);
        reject(new Error(`Failed to start FFmpeg: ${err.message}`));
      });
    });
  }

  ExtractMetadata = () => {
    return new Promise((resolve, reject) => {
      let data = '';

      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        this.inputPath,
      ]);

      ffprobe.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      ffprobe.stderr.on('data', (chunk) => {
        logger.error('ffprobe log:', chunk.toString());
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            logger.error('Failed to parse ffprobe JSON: ' + err.message);
            reject(new Error('Failed to parse ffprobe JSON: ' + err.message));
          }
        } else {
          logger.error(`ffprobe exited with code ${code}`);
          reject(new Error(`ffprobe exited with code ${code}`));
        }
      });
    });
  };

  ExtractWaveform() {
    if (!this.inputPath)
      return Promise.reject(new Error('Input path is required'));
    const outputPath = generateOutputFile(this.inputPath, 'json');

    return new Promise((resolve, reject) => {
      const waveFormMetadata = spawn(this.audiowaveform, [
        '-i',
        this.inputPath,
        '-o',
        outputPath,
        '--pixels-per-second',
        PPS.toString(),
        '-b',
        BIT.toString(),
      ]);

      let log = '';

      waveFormMetadata.stderr.on('data', (chunk) => (log += chunk.toString()));

      waveFormMetadata.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
          return outputPath;
        } else {
          logger.error(`Waveform generation failed. Code: ${code}\n${log}`);
          reject(
            new Error(`Waveform generation failed. Code: ${code}\n${log}`),
          );
        }
      });

      waveFormMetadata.on('error', (err) => {
        logger.error(`Failed to start audiowaveform: ${err.message}`);
        reject(new Error(`Failed to start audiowaveform: ${err.message}`));
      });
    });
  }
}

export { AudioProcessing };
