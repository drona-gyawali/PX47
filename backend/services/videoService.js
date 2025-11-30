import { VideoRepo } from '../repository/videoRepository.js';
import { VideoSchema } from '../schemaValidator.js';
import { logger } from '../config/logger.js';
import { ZodError } from 'zod';
import { WorkService } from '../jobs/index.js';

class VideoService {
  constructor() {
    this.video = new VideoRepo();
  }

  async createVideo(videoData) {
    try {
      const validatedVideo = VideoSchema.parse(videoData);
      const created = await this.video.createVideo(validatedVideo);
      if (!created) {
        logger.error(`Error while creating video ${created}`);
        throw new Error(`Error while creating video ${created}`);
      }
      return created;
    } catch (error) {
      logger.error(`Error while creating video ${error}`);
      if (error instanceof ZodError) {
        logger.error(`Error while creating video ${error}`);
        return error;
      }
      return error;
    }
  }

  async UpdateVideo(videoData, videoId, userId) {
    try {
      const validatedVideo = VideoSchema.parse(videoData);
      const where = { id: videoId };
      if (userId) where.userId = userId;
      const updated = await this.video.updateVideo(where, validatedVideo);
      if (!updated) {
        logger.error(`Error while creating video ${updated}`);
        throw new Error(`Error while creating video ${updated}`);
      }
      return updated;
    } catch (error) {
      logger.error(`Error while updating video ${error}`);
      if (error instanceof ZodError) {
        logger.error(`Error while updating video ${error}`);
        return error;
      }
      return error;
    }
  }

  // TODO:
  async GetContent(id, page, limit) {
    try {
      page = Number(page);
      limit = Number(limit);

      if (isNaN(page) || isNaN(limit)) {
        throw new Error('Invalid pagination values');
      }

      const result = await this.video.getVideo(id, page, limit);
      return result;
    } catch (error) {
      throw new Error('Error fetching content: ' + error);
    }
  }

  async videoUpload(videoData, key, videoId, userId) {
    try {
      const { videoQueue } = new WorkService().getQueues();
      await videoQueue.add('video-processing', {
        s3Key: key,
        videoId: videoId,
        userId: userId,
      });

      videoData.userId = userId;
      const updatedVideo = this.UpdateVideo(videoData, videoId, userId);
      return updatedVideo;
    } catch (error) {
      logger.error(`Error occured while videoUpload ${error}`);
    }
  }
}

export { VideoService };
