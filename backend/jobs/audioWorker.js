import redis from '../config/redis.js';
import { Queue, Worker } from 'bullmq';
import { AudioProcessing } from '../process/audioProcessing.js';
import { logger } from '../config/logger.js';
import { Bucket } from '../config/s3.js';
import { deleteLocalFile, SaveMetadatatoDb, jobMetadata } from '../helpers.js';

class AudioWorker {
  constructor() {
    this.redis = redis;
    this.queueName = 'audio-processing';

    this.audioQueue = new Queue(this.queueName, {
      connection: this.redis,
    });
  }

  async audioPreprocessing(job) {
    try {
      const { s3Key, userId, audioId } = jobMetadata(job);

      const s3 = new Bucket();
      const localpath = await s3.DownloadFromS3(s3Key);
      const audio = new AudioProcessing(localpath);
      logger.info('Starting ConvertToMp3...\n\n');
      const mp3File = await audio.ConvertToMp3();
      logger.info('ConvertToMp3 finished:\n\n', mp3File);

      logger.info('Extracting metadata...\n\n');
      const metadata = await audio.ExtractMetadata();
      logger.info('Metadata extracted:\n\n', metadata);

      logger.info('Extracting waveform...\n\n');
      const waveFormJson = await audio.ExtractWaveform();
      logger.info('Waveform extracted:\n\n', waveFormJson);

      const mp3Upload = await s3.UploadtoS3(mp3File, 'audio/mpeg', userId);
      const waveformUpload = await s3.UploadtoS3(
        waveFormJson,
        'application/json',
        userId,
      );

      await SaveMetadatatoDb(audioId, userId, {
        s3: {
          original: s3Key,
          mp3: mp3Upload.key,
          waveform: waveformUpload.key,
        },
        duration: Number(metadata.format.duration),
        sampleRate: Number(metadata.streams[0].sample_rate),
        bitRate: Number(metadata.format.bit_rate),
        channels: Number(metadata.streams[0].channels),
        codec: metadata.streams[0].codec_name,
        status: 'ready',
      });

      await deleteLocalFile(localpath);
      await deleteLocalFile(mp3File);
      await deleteLocalFile(waveFormJson);

      return {
        metadata,
        mp3Url: mp3Upload.key,
        waveformUrl: waveformUpload.key,
      };
    } catch (error) {
      logger.error(
        `Audio preprocessing error | job=${job.id} | ${error.message}`,
      );
      throw error;
    }
  }

  runAudioWorker() {
    const processAudio = new Worker(
      this.queueName,
      async (job) => await this.audioPreprocessing(job),
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
