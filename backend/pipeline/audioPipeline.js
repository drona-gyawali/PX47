import { AudioProcessing } from '../process/audioProcessing.js';
import { Bucket } from '../config/s3.js';
import * as utils from '../helpers.js';
import { logger } from '../config/logger.js';

export async function audioPreprocessing(job) {
  try {
    const { s3Key, userId, audioId } = utils.jobMetadata(job);
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

    await utils.SaveAudioMetadatatoDb(audioId, userId, {
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

    await utils.deleteLocalFile(localpath);
    await utils.deleteLocalFile(mp3File);
    await utils.deleteLocalFile(waveFormJson);

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
