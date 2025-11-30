import prisma from '../config/db.js';
import BaseRepo from './baseRepo.js';
import { logger } from '../config/logger.js';

class VideoRepo {
  constructor() {
    this.video = new BaseRepo(prisma.videoFile);
  }

  async createVideo(data) {
    try {
      const created = await this.video.create(data);
      return created;
    } catch (error) {
      logger.error(`Error Occured while creating video: ${error}`);
    }
  }

  async updateVideo(where, data) {
    try {
      const updated = await this.video.update(where, data);
      return updated;
    } catch (error) {
      logger.error(`Error Occured while updating video: ${error}`);
    }
  }

  async getVideo(id, limit, skipIndex) {
    try {
      const fetched = await this.video.find(id, limit, skipIndex);
      return fetched;
    } catch (error) {
      logger.error(`Error Occured while fetching video: ${error}`);
    }
  }
}

export { VideoRepo };
