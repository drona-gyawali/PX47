import AudioService from '../services/audioService.js';
import { logger } from '../config/logger.js';
import { errorResponse, successResponse } from '../helpers.js';
import status from 'http-status-codes';
import { Bucket } from '../config/s3.js';

export const CreateAudio = async (req, res) => {
  try {
    let audioData = { ...req.body, userId: req.user.userId };
    const audioCreated = await new AudioService().CreateAudioService(audioData);
    if (audioCreated instanceof Error || audioCreated?.issues) {
      return errorResponse(res, audioCreated, status.BAD_REQUEST);
    }
    audioData = { ...audioData, id: audioCreated.id };
    logger.info(`Success | fx=CreateAudio`);
    return successResponse(res, audioData, 'Audio created', status.CREATED);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const UpdateAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    let audioData = { ...req.body, userId: req.user.userId };
    const audioUpdated = await new AudioService().UpdateAudioService(
      audioData,
      audioId.toString(),
      req.user.userId,
    );
    if (!audioUpdated) {
      logger.error(`Error | fx=UpdateAudio | error=${audioData.id}`);
      errorResponse(res, audioUpdated, status.EXPECTATION_FAILED);
    }
    audioData = { ...audioData, id: audioUpdated.id };
    logger.info(`Sucess | fx=UpdateAudio `);
    successResponse(res, audioData, status.CREATED);
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getUserContent = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const audioService = new AudioService();
    const result = await audioService.GetContent(req.user.userId, page, limit);
    successResponse(res, result, status.OK);
  } catch (error) {
    console.error('Error in getUserContent:', error);
    errorResponse(res, error);
  }
};

export const generatePresignedUrl = async (req, res) => {
  try {
    const { fileName } = req.params;
    const s3 = new Bucket();
    const objectStorage = await s3.CreatePresignedUrl(
      req.user.userId,
      fileName.toString(),
    );
    let audioData = {
      ...req.params,
      userId: req.user.userId,
      status: 'uploading',
    };
    const metadata = await new AudioService().CreateAudioService(audioData);
    audioData = { ...audioData, audioId: metadata.id, objects: objectStorage };
    successResponse(res, audioData, status.CREATED);
  } catch (error) {
    console.log(error);
    errorResponse(res, JSON.stringify(error));
  }
};

export const fileUploadCompleted = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { key } = req.body;
    let audioData = { status: 'processing' };
    const confirmation = await new AudioService().fileUploaded(
      audioData,
      audioId,
      key.trim(),
      req.user.userId,
    );
    audioData = {
      ...audioData,
      id: confirmation.id,
      fileName: confirmation.fileName,
    };
    successResponse(res, audioData, status.ACCEPTED);
  } catch (error) {
    errorResponse(res, JSON.stringify(error));
  }
};

export const getContentAccess = async (req, res) => {
  try {
    const { key } = req.params;
    const url = await new Bucket().GetFileAccess(key.trim());
    successResponse(res, url, status.CREATED);
  } catch (error) {
    errorResponse(res, JSON.stringify(error));
  }
};
