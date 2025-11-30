import { lerp } from "../interpolation";
import {
  arrayToObjKeys,
  mapObjEntries,
  mapObjKeys,
  mapObjValues,
} from "../object-utils";
import { range } from "../range";

export class AudioStream<Channels extends string> {
  constructor(params: {
    channels: Channels[];
    sampleRate: number;
    duration: number;
    getRange: (
      start: number,
      count: number
    ) => Promise<Record<Channels, ArrayBuffer> | undefined>;
    getRangeByChannel: <C extends Channels>(
      start: number,
      count: number,
      channel: C
    ) => Promise<ArrayBuffer> | undefined;
  }) {
    this.getRange = params.getRange;
    this.getRangeByChannel = params.getRangeByChannel;
    this.duration = params.duration;
    this.sampleRate = params.sampleRate;
    this.channels = params.channels;
  }

  channels: Channels[];
  sampleRate: number;
  duration: number;

  getRange: (
    start: number,
    count: number
  ) => Promise<Record<Channels, ArrayBuffer> | undefined>;
  getRangeByChannel: <C extends Channels>(
    start: number,
    count: number,
    channel: C
  ) => Promise<ArrayBuffer> | undefined;
}

export function createSignal<Channels extends string>(params: {
  sampleRate: number;
  channels: Channels[];
  length: number;
  duration: number;
  constructors:
    | Record<Channels, (time: number, sampleNumber: number) => number>
    | ((time: number, sampleNumber: number) => Record<Channels, number>);
}): AudioStream<Channels> {
  const constr = params.constructors;
  const constructors: Record<
    Channels,
    (time: number, sampleNumber: number) => number
  > =
    constr instanceof Function
      ? arrayToObjKeys(params.channels, (k) => (t, c) => constr(t, c)[k])
      : constr;

  return new AudioStream({
    channels: params.channels,
    async getRange(start: number, count: number) {
      return mapObjEntries(constructors, (k, v) => [
        k,
        new Float32Array(
          range(count).map((s) => {
            return v((s + start) / this.sampleRate, s + start);
          })
        ).buffer,
      ]);
    },
    async getRangeByChannel(start, count, channel) {
      return new Float32Array(
        range(count).map((s) =>
          constructors[channel]((s + start) / this.sampleRate, s + start)
        )
      ).buffer;
    },
    sampleRate: params.sampleRate,
    duration: params.duration,
  });
}

function sameSignalOnData<Channels extends string>(
  sampleRate: number,
  channels: Channels[],
  duration: number,
  f: (time: number, sample: number) => number
) {
  return createSignal({
    channels,
    duration,
    sampleRate,
    length: Math.ceil(duration * sampleRate),
    constructors: arrayToObjKeys(channels, () => f),
  });
}

function waveform<Channels extends string>(
  sampleRate: number,
  channels: Channels[],
  seconds: number,
  frequency: number,
  amplitude: number,
  phase: number,
  profile: (f: number) => number
) {
  return sameSignalOnData(
    sampleRate,
    channels,
    seconds,
    (t) => amplitude * profile((t * frequency + phase) % 1)
  );
}

async function getRangeAndResample<Channels extends string>(
  src: AudioStream<Channels>,
  dstStart: number,
  dstCount: number,
  dstSampleRate: number
): Promise<Record<Channels, ArrayBuffer>> {
  // fallthrough case for same sample rate
  if (src.sampleRate === dstSampleRate) {
    return src.getRange(dstStart, dstCount);
  }

  // get timing info for audio range
  const startSeconds = dstStart / dstSampleRate;
  const durationSeconds = dstCount / dstSampleRate;

  // figure out the sample range to get in the source audio
  const srcStart = Math.floor(startSeconds * src.sampleRate);
  const srcCount = Math.ceil((startSeconds + durationSeconds) * src.sampleRate);

  // get that sample range in the source audio
  const srcRange = await src.getRange(srcStart, srcCount - srcStart);

  // create float32array views to read audio
  const srcRangeView = mapObjValues<Channels, ArrayBuffer, Float32Array>(
    srcRange,
    (k, x) => new Float32Array(x)
  );

  // resample audio
  return mapObjValues(srcRangeView, (k, v) => {
    return new Float32Array(
      range(dstCount).map((dstIndex) => {
        const time = dstIndex / dstSampleRate;
        const sourceIndex = time * src.sampleRate;

        const srcSamplePrev = Math.floor(sourceIndex);
        const srcSampleNext = srcSamplePrev + 1;

        return lerp(sourceIndex % 1, v[srcSamplePrev], v[srcSampleNext]);
      })
    ).buffer;
  });
}

function resample<Channels extends string>(
  audio: AudioStream<Channels>,
  targetSampleRate: number
) {
  return combineAudio(
    audio.channels,
    targetSampleRate,
    [audio] as const,
    (time, sample, ch) => ch
  );
}

function combineAudio<
  Channels extends string,
  Audio extends (AudioStream<"center"> | AudioStream<Channels>)[],
>(
  channels: Channels[],
  sampleRate: number,
  audio: Audio,
  f: (
    time: number,
    sample: number,
    ...xs: { [K in keyof Audio]: Record<Channels, number> }
  ) => {
    [K in Channels]: number;
  }
): AudioStream<Channels> {
  // derive duration and sample count from largest of all inputs
  const duration = Math.max(...audio.map((a) => a.duration));
  const length = Math.ceil(duration * sampleRate);

  // create stream
  const stream = new AudioStream<Channels>({
    channels,
    duration,
    sampleRate,
    async getRange(start, count) {
      // get resampled audio ranges from all source tracks
      const ranges: Record<string, Float32Array>[] = await Promise.all(
        audio.map(async (a) =>
          mapObjValues(
            await getRangeAndResample(
              a as AudioStream<string>,
              start,
              count,
              sampleRate
            ),
            (k, v) => new Float32Array(v)
          )
        )
      );

      // create dst audio
      const ch: Record<Channels, Float32Array> = arrayToObjKeys(
        channels,
        (k) => new Float32Array(count)
      );

      // fill dst audio
      for (const i of range(count)) {
        // reformat individual audio samples from each src track
        const samples = ranges.map((r, i) => {
          // if the track is mono, just copy its data to all channels
          if (
            audio[i].channels.length === 1 &&
            audio[i].channels[0] === "center"
          ) {
            return mapObjKeys(channels, () => r.center[i]);
          }

          // otherwise just use it normally
          return mapObjValues(r, (k, v) => v[i]);
        });

        const res = f(
          (start + i) / sampleRate,
          start + i,
          // @ts-expect-error
          ...samples
        );

        for (const c of channels) {
          ch[c][i] = res[c];
        }
      }

      return mapObjValues(ch, (k, v) => v.buffer as ArrayBuffer);
    },
    getRangeByChannel(start, count, channel) {
      return this.getRange(start, count)[channel];
    },
  });

  return stream;
}

export class AudioBuilder<Channels extends string> {
  constructor(channels: Channels[], sampleRate: number) {
    this.channels = channels;
    this.sampleRate = sampleRate;
  }

  channels: Channels[];
  sampleRate: number;

  waveform(
    seconds: number,
    frequency: number,
    amplitude: number,
    phase: number,
    profile: (f: number) => number
  ) {
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

  sine(
    seconds: number,
    frequency: number,
    amplitude: number,
    phase: number
  ): AudioStream<Channels> {
    return this.waveform(seconds, frequency, amplitude, phase, (x) =>
      Math.sin(x * Math.PI * 2)
    );
  }

  square(
    seconds: number,
    frequency: number,
    amplitude: number,
    phase: number
  ): AudioStream<Channels> {
    return this.waveform(seconds, frequency, amplitude, phase, (x) =>
      x > 0.5 ? -1 : 1
    );
  }

  saw(
    seconds: number,
    frequency: number,
    amplitude: number,
    phase: number
  ): AudioStream<Channels> {
    return this.waveform(
      seconds,
      frequency,
      amplitude,
      phase,
      (x) => x * 2.0 - 1.0
    );
  }
}

export async function playStereo(audio: AudioStream<"left" | "right">) {
  const ctx = new AudioContext();
  const src = ctx.createBufferSource();

  const len = Math.ceil(audio.sampleRate * audio.duration);

  const buf = ctx.createBuffer(2, len, audio.sampleRate);

  const range = await audio.getRange(0, len);

  buf.copyToChannel(new Float32Array(range.left), 0);
  buf.copyToChannel(new Float32Array(range.right), 1);

  src.buffer = buf;

  src.connect(ctx.destination);
  src.start();
}

export function isWorklet() {
  return eval("globalThis.registerProcessor") !== undefined;
}

const BLOCKSIZE = 8192;

export async function initBufferStreamerWorklet(src: string) {
  if (isWorklet()) {
    eval("registerProcessor")(
      "buffer-streamer",
      class extends eval("AudioWorkletProcessor") {
        constructor() {
          super();

          this.port.onmessage = async (e) => {
            const data = e.data;
            if (data.type === "buffer") {
              this.buffers.push({
                left: new Float32Array(data.buffers.left),
                right: new Float32Array(data.buffers.right),
              });
            }
          };
        }

        buffers: { left: Float32Array; right: Float32Array }[] = [];
        offsetIntoCurrentBuffer = 0;

        process(inputs, outputs, parameters) {
          const output = outputs[0];
          const outputLength = output[0].length;

          for (let i = 0; i < outputLength; i++) {
            if (this.buffers.length > 0) {
              output[0][i] = this.buffers[0].left[this.offsetIntoCurrentBuffer];
              if (output[1]) {
                output[1][i] =
                  this.buffers[0].right[this.offsetIntoCurrentBuffer];
              }

              this.offsetIntoCurrentBuffer++;
              if (
                this.offsetIntoCurrentBuffer >= this.buffers[0]?.left.length
              ) {
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
    return async (ctx: AudioContext) => {
      await ctx.audioWorklet.addModule(src);

      return () => {
        const worklet = new AudioWorkletNode(ctx, "buffer-streamer");
        return {
          worklet,
          pushData(left: Float32Array, right: Float32Array) {
            worklet.port.postMessage(
              {
                type: "buffer",
                buffers: {
                  left: left.buffer,
                  right: right.buffer,
                },
              },
              [left.buffer, right.buffer]
            );
          },
        };
      };
    };
  }
}

type BufferStreamer = ReturnType<
  Awaited<ReturnType<Awaited<ReturnType<typeof initBufferStreamerWorklet>>>>
>;

const CHUNKSIZE = 2048;

export function streamAudioToWorklet(
  stream: AudioStream<"left" | "right">,
  bs: BufferStreamer
) {
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
