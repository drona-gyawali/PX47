import { AudioProcessing } from '../process/audioProcessing.js';
import { VideoProcessing } from '../process/videoProcessing.js';
import { Bucket } from '../config/s3.js';
import * as utils from '../helpers.js';
import { logger } from '../config/logger.js';

export async function videoPreprocessing(job) {
  let localPath = '';
  try {
    const { s3Key, userId, videoId } = utils.jobMetadata(job);
    const s3 = new Bucket();

    logger.info(' Video Processing | File downloaded from bucket');
    localPath = await s3.DownloadFromS3(s3Key);

    const audioProcessor = new AudioProcessing(localPath);
    const videoProcessor = new VideoProcessing(localPath);

    const metadata = await audioProcessor.ExtractMetadata();

    const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
    const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

    const hasAudio = Boolean(audioStream);

    const VideoContentType = utils.generateContentType(metadata, 'video');
    const AudioContentType = utils.generateContentType(metadata, 'audio');

    let audioFileKey = '';
    let extractedAudio = '';
    if (hasAudio) {
      extractedAudio = await videoProcessor.ExtractAudiofromVideo();
      const audioUpload = await s3.UploadtoS3(
        extractedAudio,
        AudioContentType,
        userId,
      );
      logger.info(' Video Processing | Extracted Audio uploaded to bucket');
      audioFileKey = audioUpload.key;
    }

    const muteVideo = await videoProcessor.ExtractMuteVideo();
    const muteVideoUpload = await s3.UploadtoS3(
      muteVideo,
      VideoContentType,
      userId,
    );
    logger.info(' Video Processing | Mute Video uploaded to bucket');

    const fps = utils.parseFps(
      videoStream?.avg_frame_rate ?? videoStream?.r_frame_rate ?? null,
    );

    let audioEntry = null;
    if (hasAudio) {
      audioEntry = await utils.CreateAudioMetadatatoDb(userId, {
        s3: { audio: audioFileKey },
        fileName: metadata.format.filename,
        fileType: audioStream?.codec_type,
        duration: Number(audioStream?.duration) ?? 0,
        sampleRate: Number(audioStream?.sample_rate) ?? 0,
        bitRate: Number(audioStream?.bit_rate) ?? 0,
        channels: Number(audioStream?.channels) ?? 0,
        codec: audioStream?.codec_name ?? 'unknown',
        status: 'ready',
      });
    }
    logger.info(' Video Processing | Audio metadata saved to db');

    await utils.SaveVideoMetadatatoDb(videoId, userId, {
      s3: {
        originalKey: s3Key,
        video: muteVideoUpload.key,
        audio: audioFileKey || null,
      },
      userId: userId,
      has_audio: hasAudio,
      audioId: audioEntry?.id ?? null,
      format_name: metadata.format.format_name ?? 'unknown',
      duration: Number(metadata.format.duration) ?? 0,
      bit_rate: Number(metadata.format.bit_rate) ?? 0,
      codec: videoStream?.codec_name ?? 'unknown',
      width: Number(videoStream?.width) ?? 0,
      height: Number(videoStream?.height) ?? 0,
      pix_fmt: videoStream?.pix_fmt ?? 'unknown',
      fps: fps,
      aspect_ratio: videoStream?.display_aspect_ratio ?? 'unknown',
      color_space: videoStream?.color_space ?? 'unknown',
      color_primaries: videoStream?.color_primaries ?? 'unknown',
      color_transfer: videoStream?.color_transfer ?? 'unknown',
      language: videoStream?.tags?.language ?? 'unknown',
      title: metadata.format.filename ?? 'unknown',
      status: 'ready',
    });

    logger.info(' Video Processing | video metadata saved to db');

    await utils.deleteLocalFile(localPath);
    await utils.deleteLocalFile(muteVideo);
    await utils.deleteLocalFile(extractedAudio);
    logger.info(' Video Processing | Flie cleanup completed locally');

    return {
      metadata,
      audio: audioFileKey,
      video: muteVideoUpload.key,
    };
  } catch (error) {
    await utils.deleteLocalFile(localPath);
    await utils.deleteLocalFile(muteVideo);
    await utils.deleteLocalFile(extractedAudio);
    logger.error(
      `Video preprocessing error | job=${job.id} | ${error.message}`,
    );
    throw error;
  }
}
