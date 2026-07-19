import { DeepgramSocketService } from './deepgramSocketService';
import { EventEmitter } from 'events';
import * as fs from 'fs';

export class AudioStreamService extends EventEmitter {
  private deepgramService: DeepgramSocketService;
  private writeStream: fs.WriteStream | null = null;
  private startTime: number | null = null;
  
  constructor(deepgramService: DeepgramSocketService) {
    super();
    this.deepgramService = deepgramService;
    const fs = require('fs');
    this.writeStream = fs.createWriteStream('test.webm');
  }

  /**
   * Process incoming audio chunk from the client and forward it to Deepgram
   * @param chunk Buffer or base64 string
   */
  public processIncomingAudio(chunk: Buffer | string) {
    try {
      let buffer: Buffer;
      if (typeof chunk === 'string') {
        buffer = Buffer.from(chunk, 'base64');
      } else {
        buffer = chunk;
      }
      
      if (!this.startTime) this.startTime = Date.now();
      if (Date.now() - this.startTime < 10000 && this.writeStream) {
        this.writeStream.write(buffer);
      } else if (this.writeStream) {
        this.writeStream.end();
        this.writeStream = null;
        console.log('Finished writing 10s of audio to test.webm');
      }

      // Basic validation (e.g., minimum chunk size if needed)
      if (buffer.length > 0) {
        this.deepgramService.sendAudio(buffer);
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      this.emit('error', error);
    }
  }
}
