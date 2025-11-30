import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config/conf.js';
import status from 'http-status-codes';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import {
  LOCAL_FOLDER,
  VIDEO_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEOMIME,
  AUDIOMIME,
} from './config/constants.js';
import path, { dirname } from 'path';
import { logger } from './config/logger.js';
import { fileURLToPath } from 'url';
import AudioService from './services/audioService.js';
import { ZodError } from 'zod';
import { Bucket } from './config/s3.js';
import { VideoService } from './services/videoService.js';

export const hashPassword = async (rawPassword) => {
  try {
    let salt = await bcrypt.genSalt(7);
    const hashed = await bcrypt.hash(rawPassword, salt);
    return hashed;
  } catch (error) {
    throw new Error(`Error occurred while hashing password: ${error}`);
  }
};

export const verifyPassword = async (rawPassword, encodedPassword) => {
  try {
    const isPassword = await bcrypt.compare(rawPassword, encodedPassword);
    return isPassword;
  } catch (error) {
    throw new Error(`Error occurred while verifying password: ${error}`);
  }
};

export const createToken = (userId, expries) => {
  try {
    const token = jwt.sign({ userId: userId }, JWT_SECRET, {
      expiresIn: expries,
    });
    return token;
  } catch (error) {
    throw new Error(`Error occurred while creating token: ${error}`);
  }
};

export const verifyToken = (token) => {
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    if (!decode) {
      return { message: 'Unverified user' };
    }
    return decode;
  } catch (error) {
    throw new Error(`Error occurred while verifying token: ${error}`);
  }
};

export const setCookie = (req, res, token, isRefresh) => {
  const name = isRefresh ? 'refresh_token' : 'access_token';
  res.cookie(name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
};

export const successResponse = (
  res,
  data = {},
  message = null,
  statusCode = status.OK,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
};

export const errorResponse = (
  res,
  error = 'Something went wrong',
  statusCode = status.BAD_REQUEST,
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message: null,
    error,
  });
};

export const getFileExt = (filepath) => {
  return filepath.split('.').pop().toLowerCase();
};

export const generateOutputFile = (inputPath, ext = null) => {
  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));
  const uniqueKey = randomUUID();
  const uuid_ = uniqueKey.split('-')[0];
  return path.join(
    dir,
    `${name}-${uuid_}.${ext || path.extname(inputPath).slice(1)}`,
  );
};

export const ignoreExt = (inputFile) => {
  const ext = ['.m4p', '.dss', '.xma', '.ape', '.alac'];
  return ext.includes(inputFile.split('.')[0]);
};

export function CheckExt(FileName) {
  const _file = FileName?.split('.')[1];
  const IsAudio = AUDIO_EXTENSIONS.includes(_file);
  const IsVideo = VIDEO_EXTENSIONS.includes(_file);
  return {
    IsAudio,
    IsVideo,
  };
}

export const generateS3Key = (userId, filename) => {
  const uniqueKey = randomUUID();
  const uuid_ = uniqueKey.split('-')[0];
  const key = `${userId}-${uuid_}-${filename}`;
  return key;
};

export async function createLocalPath(fileName) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const newFolderPath = path.join(__dirname, LOCAL_FOLDER);
    await fs.mkdir(newFolderPath, { recursive: true });
    const finalFullPath = path.join(newFolderPath, fileName);
    return finalFullPath;
  } catch (error) {
    logger.error(`Error while creating local path | error=${error}`);
    throw new Error(error);
  }
}

export async function deleteLocalFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

export function generateContentType(metadata, streamType = 'video') {
  if (!metadata || !metadata.streams) return null;

  const stream = metadata.streams.find((s) => s.codec_type === streamType);
  if (!stream) return null;

  const codec = stream.codec_name;

  if (streamType === 'video') {
    return VIDEOMIME[codec] || 'video/mp4';
  }

  if (streamType === 'audio') {
    return AUDIOMIME[codec] || 'audio/mpeg';
  }

  return null;
}

export async function SaveAudioMetadatatoDb(audioId, userId, audioData, job) {
  const audioService = new AudioService();
  try {
    await audioService.UpdateAudioService(audioData, audioId, userId);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        `Zod validation failed | job=${job.id} | errors=${JSON.stringify(error.errors)}`,
      );
    } else {
      logger.error(
        `Audio preprocessing error | job=${job.id} | ${error.message}`,
      );
    }
    throw error;
  }
}

export async function CreateAudioMetadatatoDb(userId, audioData, job) {
  const audioService = new AudioService();
  try {
    audioData.userId = userId;
    const data = await audioService.CreateAudioService(audioData);
    return data;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        `Zod validation failed | job=${job.id} | errors=${JSON.stringify(error.errors)}`,
      );
    } else {
      logger.error(`Audio creation error | job=${job.id} | ${error.message}`);
    }
    throw error;
  }
}

export async function SaveVideoMetadatatoDb(videoId, userId, videoData, job) {
  const videoService = new VideoService();
  try {
    const data = await videoService.UpdateVideo(videoData, videoId, userId);
    return data;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        `Zod validation failed | job=${job.id} | errors=${JSON.stringify(error.errors)}`,
      );
    } else {
      logger.error(
        `Audio preprocessing error | job=${job.id} | ${error.message}`,
      );
    }
    throw error;
  }
}

export function jobMetadata(job) {
  const s3Key = job.data.s3Key;
  const userId = job.data.userId;
  const audioId = job.data.audioId;
  const videoId = job.data.videoId || null;
  return {
    s3Key,
    userId,
    audioId,
    videoId,
  };
}

export const parseFps = (fpsValue) => {
  if (!fpsValue || fpsValue === '0/0') return 0;
  const [num, den] = fpsValue.split('/').map(Number);
  if (!num || !den) return 0;
  return num / den;
};
