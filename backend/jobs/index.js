import { AudioWorker } from './audioWorker.js';

class WorkService {
  constructor() {
    this.audio = new AudioWorker();
  }
  startAll() {
    this.audio.runAudioWorker();
  }

  getQueues() {
    return {
      audioQueue: this.audio.audioQueue,
    };
  }
}

export { WorkService };
