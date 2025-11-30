import { VideoService } from '../services/videoService.js';
import status from 'http-status-codes';
import { logger } from '../config/logger.js';
import { successResponse, errorResponse } from '../helpers.js';

export const CreateVideo = async (req, res) => {
  try {
    let videoData = { ...req.body, userId: req.user.userId };
    const videoCreated = await new VideoService().createVideo(videoData);
    if (videoCreated instanceof Error || videoCreated?.issues) {
      return errorResponse(res, videoCreated, status.BAD_REQUEST);
    }
    videoData = { ...videoData, id: videoCreated.id };
    logger.info(`Success | fx=CreateVideo`);
    return successResponse(res, videoData, 'Video created', status.CREATED);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const UpdateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    let videoData = { ...req.body, userId: req.user.userId };
    const videoUpdated = await new VideoService().UpdateVideo(
      videoData,
      videoId.toString(),
      req.user.userId,
    );
    if (!videoUpdated) {
      logger.error(`Error | fx=UpdateVideo | error=${videoData.id}`);
      errorResponse(res, videoUpdated, status.EXPECTATION_FAILED);
    }
    videoData = { ...videoData, id: videoUpdated.id };
    logger.info(`Sucess | fx=UpdateVideo `);
    successResponse(res, videoData, status.CREATED);
  } catch (error) {
    errorResponse(res, error);
  }
};

export const VideoUploadCompleted = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { key } = req.body;
    let videoData = { status: 'processing' };
    const confirmation = await new VideoService().videoUpload(
      videoData,
      key,
      videoId,
      req.user.userId,
    );
    videoData = {
      ...videoData,
      id: confirmation.id,
      fileName: confirmation.fileName,
    };
    successResponse(res, videoData, status.ACCEPTED);
  } catch (error) {
    errorResponse(res, JSON.stringify(error));
  }
};
