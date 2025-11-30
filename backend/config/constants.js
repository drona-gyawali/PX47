export const CODEC = 'libmp3lame';
export const BITRATE = '128k';
export const CHANNELS = 2;
export const SAMPLERATE = 44100;
export const BIT = 8;
export const PPS = 10;
export const S3_EXPIRES = 3600;
export const LOCAL_FOLDER = 'temp-disk';

export const VIDEO_EXTENSIONS = [
  'mp4',
  'mov',
  'avi',
  'mkv',
  'flv',
  'wmv',
  'webm',
  'm4v',
  '3gp',
  '3g2',
  'mpeg',
  'mpg',
  'ts',
  'm2ts',
  'vob',
  'ogv',
  'f4v',
];

export const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'aac',
  'flac',
  'ogg',
  'm4a',
  'wma',
  'amr',
  'aiff',
  'alac',
  'opus',
  'mid',
  'midi',
  'caf',
];

export const VIDEOMIME = {
  h264: 'video/mp4',
  hevc: 'video/mp4',
  vp8: 'video/webm',
  vp9: 'video/webm',
  av1: 'video/mp4',
  mpeg4: 'video/mp4',
  mpeg2video: 'video/mpeg',
};

export const AUDIOMIME = {
  aac: 'audio/aac',
  mp3: 'audio/mpeg',
  opus: 'audio/opus',
  vorbis: 'audio/vorbis',
  ac3: 'audio/ac3',
  eac3: 'audio/eac3',
  flac: 'audio/flac',
  pcm_s16le: 'audio/wav',
};
