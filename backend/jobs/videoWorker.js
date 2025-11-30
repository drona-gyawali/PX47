import redis from '../config/redis.js';
import { Worker, Queue } from 'bullmq';
import { logger } from '../config/logger.js';
import { videoPreprocessing } from '../pipeline/videoPipeline.js';

class VideoWorker {
  constructor() {
    this.connection = redis;
    this.queueName = 'video-processing';
    this.videoQueue = new Queue(this.queueName, {
      connection: this.connection,
    });
  }

  RunVideoWorker() {
    const videoWorker = new Worker(
      this.queueName,
      async (job) => await videoPreprocessing(job),
      { connection: this.connection },
    );

    videoWorker.on('completed', (job) => {
      logger.info(`Video Processing Completed | ${job.id}`);
    });

    videoWorker.on('failed', (job, error) => {
      logger.info(`Video Processing Failed | ${job.id} | ${error}`);
    });
  }
}

export { VideoWorker };
