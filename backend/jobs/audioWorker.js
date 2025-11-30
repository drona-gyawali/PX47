import redis from '../config/redis.js';
import { Queue, Worker } from 'bullmq';
import { logger } from '../config/logger.js';
import { audioPreprocessing } from '../pipeline/audioPipeline.js';

class AudioWorker {
  constructor() {
    this.redis = redis;
    this.queueName = 'audio-processing';

    this.audioQueue = new Queue(this.queueName, {
      connection: this.redis,
    });
  }

  runAudioWorker() {
    const processAudio = new Worker(
      this.queueName,
      async (job) => await audioPreprocessing(job),
      { connection: this.redis },
    );

    processAudio.on('completed', (job) => {
      logger.info(`Audio processing completed | ${job.id}`);
    });

    processAudio.on('failed', (job, err) => {
      logger.error(`Audio processing failed | ${job.id} | ${err.message}`);
    });
  }
}

export { AudioWorker };
