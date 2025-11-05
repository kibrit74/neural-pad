// AudioWorklet processor to capture PCM chunks for Electron speech
// Runs in AudioWorkletGlobalScope
class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = (options && options.processorOptions) || {};
    this._channels = opts.channels || 1;
    this._buffer = [];
    this._count = 0;
    this._chunkDurationMs = opts.chunkDurationMs || 1500;
    this._sampleRate = sampleRate; // provided by AudioWorkletGlobalScope
    this._samplesPerChunk = Math.floor(this._sampleRate * (this._chunkDurationMs / 1000));
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }
    // Use first channel (mono)
    const channelData = input[0];
    if (!channelData) {
      return true;
    }

    // Copy buffer to avoid referencing recycled memory
    const copy = new Float32Array(channelData.length);
    copy.set(channelData);
    this._buffer.push(copy);
    this._count += copy.length;

    if (this._count >= this._samplesPerChunk) {
      const totalLength = this._buffer.reduce((sum, arr) => sum + arr.length, 0);
      const chunk = new Float32Array(totalLength);
      let offset = 0;
      for (const arr of this._buffer) {
        chunk.set(arr, offset);
        offset += arr.length;
      }
      this._buffer = [];
      this._count = 0;
      // Transfer the underlying ArrayBuffer to main thread
      this.port.postMessage({ type: 'chunk', data: chunk.buffer }, [chunk.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);