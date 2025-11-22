import prisma from '../config/db.js';
import BaseRepo from './baseRepo.js';

class AudioRepo {
  constructor() {
    this.audio = new BaseRepo(prisma.audioFile);
  }

  async CreateAudio(data) {
    try {
      const audioCreated = await this.audio.create(data);
      if (!audioCreated) return { message: 'falied to create audio' };
      return audioCreated;
    } catch (error) {
      throw new Error(`Error occurred while creating audio: ${error}`);
    }
  }

  async UpdateAudio(where, data) {
    try {
      const audioUpdated = await this.audio.update(where, data);
      if (!audioUpdated) return { message: 'falied to update audio' };
      return audioUpdated;
    } catch (error) {
      throw new Error(`Error occurred while updating audio: ${error}`);
    }
  }

  async FindContent(id, page, limit) {
    try {
      const skipIndex = (page - 1) * limit;
      const { totalCount, fetched } = await this.audio.find(
        id,
        limit,
        skipIndex,
      );
      const safeFetched = fetched.map((audio) => ({
        ...audio,
        fileSize: audio.fileSize?.toString() || null,
      }));
      return {
        page,
        limit,
        total: totalCount,
        data: safeFetched,
      };
    } catch (error) {
      throw new Error('Error fetching content: ' + error);
    }
  }
}

export default AudioRepo;
