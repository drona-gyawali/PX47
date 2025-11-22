import AudioRepo from '../repository/audioRepository.js';
import { AudioSchema } from '../schemaValidator.js';
import { logger } from '../config/logger.js';
import { WorkService } from '../jobs/index.js';
import { ZodError } from 'zod';

class AudioService {
  constructor() {
    this.audio = new AudioRepo();
  }

  async CreateAudioService(audioData) {
    try {
      const validatedData = AudioSchema.parse(audioData);
      const audioCreated = await this.audio.CreateAudio(validatedData);
      if (!audioCreated) {
        logger.error(`Error | fx=CreateAudioService | error=${audioCreated}`);
        return { message: 'Failed to create audio' };
      }
      logger.info('Success | fx=CreateAudioService');
      return audioCreated;
    } catch (error) {
      logger.error(`Error | fx=CreateAudioService | error=${error}`);
      if (error instanceof ZodError) {
        return error;
      }
      return error;
    }
  }

  async UpdateAudioService(audioData, audioId, userId) {
    try {
      audioData.userId = userId;
      const validatedData = AudioSchema.parse(audioData);

      const where = { id: audioId };
      if (userId) where.userId = userId;
      const audioUpdated = await this.audio.UpdateAudio(where, validatedData);
      if (!audioUpdated) {
        logger.error(`Error | fx=UpdateAudioService | error=${audioUpdated}`);
        return {
          message: 'Failed to update audio',
        };
      }
      logger.info('Success | fx=UpdateAudioService');
      return audioUpdated;
    } catch (error) {
      logger.error(`Error | fx=UpdateAudioService | error=${error}`);
      if (error instanceof ZodError) return { validationError: error.errors };
      return { error: error.message };
    }
  }

  async GetContent(id, page, limit) {
    try {
      page = Number(page);
      limit = Number(limit);

      if (isNaN(page) || isNaN(limit)) {
        throw new Error('Invalid pagination values');
      }

      const result = await this.audio.FindContent(id, page, limit);
      return result;
    } catch (error) {
      throw new Error('Error fetching content: ' + error);
    }
  }

  async fileUploaded(audioData, audioId, key, userId) {
    try {
      const { audioQueue } = new WorkService().getQueues();
      await audioQueue.add('audio-processing', {
        audioId: audioId,
        s3Key: key,
        userId: userId,
      });
      audioData.userId = userId;
      const updatedData = await this.UpdateAudioService(
        audioData,
        audioId,
        userId,
      );
      return updatedData;
    } catch (error) {
      logger.error(`Error | fx=fileUploaded | error=${error}`);
    }
  }
}

export default AudioService;
