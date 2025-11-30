import { AudioWorker } from './audioWorker.js';
import { VideoWorker } from './videoWorker.js';

class WorkService {
  constructor() {
    this.audio = new AudioWorker();
    this.video = new VideoWorker();
  }
  startAll() {
    this.audio.runAudioWorker();
    this.video.RunVideoWorker();
  }

  getQueues() {
    return {
      audioQueue: this.audio.audioQueue,
      videoQueue: this.video.videoQueue,
    };
  }
}

export { WorkService };
