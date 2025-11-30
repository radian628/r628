(() => {
  // src/interpolation.ts
  function lerp(x, a2, b) {
    return a2 * (1 - x) + b * x;
  }

  // src/object-utils.ts
  function arrayToMapKeys(arr, f) {
    return new Map(arr.map((x) => [x, f(x)]));
  }
  function arrayToObjKeys(arr, f) {
    return map2obj(arrayToMapKeys(arr, f));
  }
  function mapObjKeys(obj, callback) {
    return mapObjEntries(obj, (k, v) => [callback(k, v), v]);
  }
  function mapObjValues(obj, callback) {
    return mapObjEntries(obj, (k, v) => [k, callback(k, v)]);
  }
  function mapObjEntries(obj, callback) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => callback(k, v))
    );
  }
  function map2obj(map) {
    return Object.fromEntries(map.entries());
  }
  var ALL = Symbol("allKeys");
  var _ALL = Symbol("all2");

  // src/range.ts
  function range(hi) {
    let arr = [];
    for (let i = 0; i < hi && i < 1e7; i++) {
      arr.push(i);
    }
    return arr;
  }

  // src/audio/stream-audio.ts
  var AudioStream = class {
    constructor(params) {
      this.getRange = params.getRange;
      this.getRangeByChannel = params.getRangeByChannel;
      this.duration = params.duration;
      this.sampleRate = params.sampleRate;
      this.channels = params.channels;
    }
  };
  function createSignal(params) {
    const constr = params.constructors;
    const constructors = constr instanceof Function ? arrayToObjKeys(params.channels, (k) => (t, c) => constr(t, c)[k]) : constr;
    return new AudioStream({
      channels: params.channels,
      async getRange(start, count) {
        return mapObjEntries(constructors, (k, v) => [
          k,
          new Float32Array(
            range(count).map((s) => {
              return v((s + start) / this.sampleRate, s + start);
            })
          ).buffer
        ]);
      },
      async getRangeByChannel(start, count, channel) {
        return new Float32Array(
          range(count).map(
            (s) => constructors[channel]((s + start) / this.sampleRate, s + start)
          )
        ).buffer;
      },
      sampleRate: params.sampleRate,
      duration: params.duration
    });
  }
  function sameSignalOnData(sampleRate, channels, duration, f) {
    return createSignal({
      channels,
      duration,
      sampleRate,
      length: Math.ceil(duration * sampleRate),
      constructors: arrayToObjKeys(channels, () => f)
    });
  }
  function waveform(sampleRate, channels, seconds, frequency, amplitude, phase, profile) {
    return sameSignalOnData(
      sampleRate,
      channels,
      seconds,
      (t) => amplitude * profile((t * frequency + phase) % 1)
    );
  }
  async function getRangeAndResample(src2, dstStart, dstCount, dstSampleRate) {
    if (src2.sampleRate === dstSampleRate) {
      return src2.getRange(dstStart, dstCount);
    }
    const startSeconds = dstStart / dstSampleRate;
    const durationSeconds = dstCount / dstSampleRate;
    const srcStart = Math.floor(startSeconds * src2.sampleRate);
    const srcCount = Math.ceil((startSeconds + durationSeconds) * src2.sampleRate);
    const srcRange = await src2.getRange(srcStart, srcCount - srcStart);
    const srcRangeView = mapObjValues(
      srcRange,
      (k, x) => new Float32Array(x)
    );
    return mapObjValues(srcRangeView, (k, v) => {
      return new Float32Array(
        range(dstCount).map((dstIndex) => {
          const time = dstIndex / dstSampleRate;
          const sourceIndex = time * src2.sampleRate;
          const srcSamplePrev = Math.floor(sourceIndex);
          const srcSampleNext = srcSamplePrev + 1;
          return lerp(sourceIndex % 1, v[srcSamplePrev], v[srcSampleNext]);
        })
      ).buffer;
    });
  }
  function resample(audio, targetSampleRate) {
    return combineAudio(
      audio.channels,
      targetSampleRate,
      [audio],
      (time, sample, ch) => ch
    );
  }
  function combineAudio(channels, sampleRate, audio, f) {
    const duration = Math.max(...audio.map((a2) => a2.duration));
    const length = Math.ceil(duration * sampleRate);
    const stream = new AudioStream({
      channels,
      duration,
      sampleRate,
      async getRange(start, count) {
        const ranges = await Promise.all(
          audio.map(
            async (a2) => mapObjValues(
              await getRangeAndResample(
                a2,
                start,
                count,
                sampleRate
              ),
              (k, v) => new Float32Array(v)
            )
          )
        );
        const ch = arrayToObjKeys(
          channels,
          (k) => new Float32Array(count)
        );
        for (const i of range(count)) {
          const samples = ranges.map((r, i2) => {
            if (audio[i2].channels.length === 1 && audio[i2].channels[0] === "center") {
              return mapObjKeys(channels, () => r.center[i2]);
            }
            return mapObjValues(r, (k, v) => v[i2]);
          });
          const res = f(
            (start + i) / sampleRate,
            start + i,
            ...samples
          );
          for (const c of channels) {
            ch[c][i] = res[c];
          }
        }
        return mapObjValues(ch, (k, v) => v.buffer);
      },
      getRangeByChannel(start, count, channel) {
        return this.getRange(start, count)[channel];
      }
    });
    return stream;
  }
  var AudioBuilder = class {
    constructor(channels, sampleRate) {
      this.channels = channels;
      this.sampleRate = sampleRate;
    }
    waveform(seconds, frequency, amplitude, phase, profile) {
      return waveform(
        this.sampleRate,
        this.channels,
        seconds,
        frequency,
        amplitude,
        phase,
        profile
      );
    }
    sine(seconds, frequency, amplitude, phase) {
      return this.waveform(
        seconds,
        frequency,
        amplitude,
        phase,
        (x) => Math.sin(x * Math.PI * 2)
      );
    }
    square(seconds, frequency, amplitude, phase) {
      return this.waveform(
        seconds,
        frequency,
        amplitude,
        phase,
        (x) => x > 0.5 ? -1 : 1
      );
    }
    saw(seconds, frequency, amplitude, phase) {
      return this.waveform(
        seconds,
        frequency,
        amplitude,
        phase,
        (x) => x * 2 - 1
      );
    }
  };
  async function playStereo(audio) {
    const ctx = new AudioContext();
    const src2 = ctx.createBufferSource();
    const len = Math.ceil(audio.sampleRate * audio.duration);
    const buf = ctx.createBuffer(2, len, audio.sampleRate);
    const range2 = await audio.getRange(0, len);
    buf.copyToChannel(new Float32Array(range2.left), 0);
    buf.copyToChannel(new Float32Array(range2.right), 1);
    src2.buffer = buf;
    src2.connect(ctx.destination);
    src2.start();
  }
  function isWorklet() {
    return eval("globalThis.registerProcessor") !== void 0;
  }
  var BLOCKSIZE = 8192;
  async function initBufferStreamerWorklet(src) {
    if (isWorklet()) {
      eval("registerProcessor")(
        "buffer-streamer",
        class extends eval("AudioWorkletProcessor") {
          constructor() {
            super();
            this.buffers = [];
            this.offsetIntoCurrentBuffer = 0;
            this.port.onmessage = async (e) => {
              const data = e.data;
              if (data.type === "buffer") {
                this.buffers.push({
                  left: new Float32Array(data.buffers.left),
                  right: new Float32Array(data.buffers.right)
                });
              }
            };
          }
          process(inputs, outputs, parameters) {
            const output = outputs[0];
            const outputLength = output[0].length;
            for (let i = 0; i < outputLength; i++) {
              if (this.buffers.length > 0) {
                output[0][i] = this.buffers[0].left[this.offsetIntoCurrentBuffer];
                if (output[1]) {
                  output[1][i] = this.buffers[0].right[this.offsetIntoCurrentBuffer];
                }
                this.offsetIntoCurrentBuffer++;
                if (this.offsetIntoCurrentBuffer >= this.buffers[0]?.left.length) {
                  this.offsetIntoCurrentBuffer = 0;
                  this.buffers.shift();
                }
              } else {
                output[0][i] = 0;
                if (output[1]) {
                  output[1][i] = 0;
                }
              }
            }
            return true;
          }
        }
      );
    } else {
      return async (ctx) => {
        await ctx.audioWorklet.addModule(src);
        return () => {
          const worklet = new AudioWorkletNode(ctx, "buffer-streamer");
          return {
            worklet,
            pushData(left, right) {
              worklet.port.postMessage(
                {
                  type: "buffer",
                  buffers: {
                    left: left.buffer,
                    right: right.buffer
                  }
                },
                [left.buffer, right.buffer]
              );
            }
          };
        };
      };
    }
  }
  var CHUNKSIZE = 2048;
  function streamAudioToWorklet(stream, bs) {
    let t = 0;
    const loop = async () => {
      const { left, right } = await stream.getRange(t, CHUNKSIZE);
      bs.pushData(new Float32Array(left), new Float32Array(right));
      t += CHUNKSIZE;
      if (t <= Math.max(stream.duration * stream.sampleRate)) {
        setTimeout(loop);
      }
    };
    loop();
  }

  // demos-src/audio-stream.demo.ts
  var a = new AudioBuilder(["left", "right"], 44100);
  var w = a.saw(4, 440, 0.1, 0);
  var initWorklet = initBufferStreamerWorklet("audio-stream.demo.js");
  if (!isWorklet()) {
    document.onclick = async () => {
      const ctx = new AudioContext();
      const createWorklet = await (await initWorklet)(ctx);
      const bufferStreamer = createWorklet();
      streamAudioToWorklet(w, bufferStreamer);
      const osc = new OscillatorNode(ctx);
      osc.connect(bufferStreamer.worklet).connect(ctx.destination);
      osc.start();
    };
  }
})();
