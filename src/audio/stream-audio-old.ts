import { lerp } from "../interpolation";
import {
  arrayToMapValues,
  arrayToObjKeys,
  arrayToObjValues,
  mapObjEntries,
  mapObjValues,
} from "../object-utils";
import { range } from "../range";

type AudioStreamPlugins<
  Channels extends string,
  Plugins extends ASP<Channels, Plugins>,
> = {
  local: Record<
    any,
    (stream: AudioStream<Channels, Plugins>, ...args: any[]) => any
  >;
  global: Record<
    any,
    (builder: AudioStreamBuilder<Plugins, Channels>, ...args: any[]) => any
  >;
};

type NoFirstArg<T extends (...a: any[]) => any> = T extends (
  ...a: infer Args extends [any, ...(infer Rest)[]]
) => infer Ret
  ? (args: Rest) => Ret
  : never;

type NoFirstArgObj<O extends Record<any, any>> = {
  [K in keyof O]: NoFirstArg<O[K]>;
};

type ASP<
  Channels extends string,
  Plugins extends ASP<Channels, Plugins>,
> = AudioStreamPlugins<Channels, Plugins>;

type AudioStream<
  Channels extends string,
  Plugins extends ASP<Channels, Plugins>,
> = {
  _isAudioStream: true;
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
  sampleRate: number;
} & NoFirstArgObj<Plugins["local"]>;

type Mono<P extends ASP<"center", P>> = AudioStream<"center", P>;
type Stereo<P extends ASP<"left" | "right", P>> = AudioStream<
  "left" | "right",
  P
>;

type AudioStreamBuilderParams<
  Plugins extends ASP<Channels, Plugins>,
  Channels extends string,
> = {
  defaultSampleRate: number;
  defaultChannels: Channels[];
  plugins: Plugins;
};

type AudioStreamBuilder<
  Plugins extends ASP<Channels, Plugins>,
  Channels extends string,
> = {
  plugins: Plugins;
  defaultChannels: Channels[];
  defaultSampleRate: number;
} & NoFirstArgObj<Plugins["global"]>;

export function createAudioStreamBuilder<
  Plugins extends ASP<Channels, Plugins>,
  Channels extends string,
>(
  params: AudioStreamBuilderParams<Plugins, Channels>
): AudioStreamBuilder<Plugins, Channels> {
  const asb = { plugins: params.plugins } as unknown as AudioStreamBuilder<
    Plugins,
    Channels
  >;

  for (const [k, g] of Object.entries(params.plugins.global)) {
    // @ts-expect-error
    asb[k] = (...args) => g(asb, ...args);
  }

  return asb;
}

export function createSignal<
  Plugins extends ASP<Channels, Plugins>,
  Channels extends string,
>(params: {
  builder: AudioStreamBuilder<Plugins, Channels>;
  sampleRate: number;
  length: number;
  duration: number;
  constructors:
    | Record<Channels, (time: number, sampleNumber: number) => number>
    | ((time: number, sampleNumber: number) => Record<Channels, number>);
}): AudioStream<Channels, Plugins> {
  const constr = params.constructors;
  const constructors: Record<
    Channels,
    (time: number, sampleNumber: number) => number
  > =
    constr instanceof Function
      ? arrayToObjKeys(
          params.builder.defaultChannels,
          (k) => (t, c) => constr(t, c)[k]
        )
      : constr;

  const stream: AudioStream<Channels, Plugins> = {
    _isAudioStream: true,
    duration: params.duration,
    sampleRate: params.sampleRate,
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
          params.constructors[channel]((s + start) / this.sampleRate, s + start)
        )
      ).buffer;
    },
  } as unknown as AudioStream<Channels, Plugins>;

  for (const [k, l] of Object.entries(params.builder.plugins.local)) {
    // @ts-expect-error
    stream[k] = (...args) => l(stream, ...args);
  }

  return stream;
}

type EmptyPlugin = {
  global: {};
  local: {};
};

async function getRangeAndResample<Channels extends string>(
  stream: AudioStream<Channels, EmptyPlugin>,
  start: number,
  count: number,
  targetSampleRate: number
): Promise<Record<Channels, ArrayBuffer>> {
  if (stream.sampleRate === targetSampleRate) {
    return stream.getRange(start, count);
  }

  const startSeconds = start / targetSampleRate;
  const durationSeconds = count / targetSampleRate;

  const startSample = Math.floor(startSeconds * stream.sampleRate);
  const endSample = Math.ceil(
    (startSeconds + durationSeconds) * stream.sampleRate
  );

  const r = await stream.getRange(startSample, endSample - startSample);

  const f32a = mapObjValues<Channels, ArrayBuffer, Float32Array>(
    r,
    (k, x) => new Float32Array(x)
  );

  return mapObjValues(f32a, (k, v) => {
    return new Float32Array(
      range(count).map((i) => {
        const rawIndex = ((i + start) / targetSampleRate) * stream.sampleRate;
        const prev = Math.floor(rawIndex);
        const next = prev + 1;

        return lerp(rawIndex % 1, v[prev], v[next]);
      })
    ).buffer;
  });
}

// function sameSignalOnData<Channels> (builder: AudioStreamBuilder<EmptyPlugin,  >: (time: number, sample: number) => number) {
//     return createSignal({
//       builder,
//       sampleRate: builder.defaultSampleRate,
//       length: Math.ceil(seconds * builder.defaultSampleRate),
//       duration: seconds,
//       constructors: arrayToObjValues(builder.defaultChannels, f),
//     });
// }

type WaveformGenerator<
  Ch extends string,
  Pl extends AudioStreamPlugins<Ch, Pl>,
> = (
  builder: AudioStreamBuilder<Pl, Ch>,
  seconds: number,
  frequency: number,
  amplitude?: number,
  phase?: number
) => AudioStream<Ch, Pl>;

type AnyPlugin<Ch extends string> = ASP<Ch, any>;

type StreamAudioStdlib<
  Channels extends string,
  Plugins extends AnyPlugin<Channels>,
> = {
  global: {
    silence: (
      builder: AudioStreamBuilder<Plugins, Channels>,
      seconds: number
    ) => AudioStream<Channels, Plugins>;
    waveform: (
      builder: AudioStreamBuilder<Plugins, Channels>,
      seconds: number,
      frequency: number,
      amplitude: number,
      phase: number,
      profile: (f: number) => number
    ) => AudioStream<Channels, Plugins>;
    sine: WaveformGenerator<Channels, Plugins>;
    square: WaveformGenerator<Channels, Plugins>;
    saw: WaveformGenerator<Channels, Plugins>;
    combineAudio: <
      Audio extends (Mono<EmptyPlugin> | AudioStream<Channels, Plugins>)[],
    >(
      builder,
      audio: Audio,
      f: (
        time: number,
        sample: number,
        ...xs: { [K in keyof Audio]: number }
      ) => {
        [K in keyof Channels]: (
          time: number,
          sample: number,
          ...xs: { [K in keyof Audio]: number }
        ) => number;
      }
    ) => AudioStream<Channels, Plugins>;
  };
  local: {};
};

type MergePlugins<
  Channels extends string,
  Plugins extends ASP<Channels, any>[],
> = Plugins extends [
  infer A extends ASP<Channels, any>,
  infer B extends ASP<Channels, any>,
  ...infer R extends ASP<Channels, any>[],
]
  ? MergePlugins<
      Channels,
      [
        {
          local: A["local"] & B["local"];
          global: A["global"] & B["global"];
        },
        ...R,
      ]
    >
  : Plugins extends [infer A]
    ? A
    : never;

function mergePlugins<
  Channels extends string,
  Plugins extends ASP<Channels, any>[],
>(...plugins: Plugins): MergePlugins<Channels, Plugins> {
  // @ts-expect-error
  return {
    local: Object.fromEntries(
      plugins.map((p) => Object.entries(p.local)).flat(1)
    ),
    global: Object.fromEntries(
      plugins.map((p) => Object.entries(p.global)).flat(1)
    ),
  };
}

function mergePluginGenerators<G extends PluginGenerator[]>(
  ...generators: G
): <Channels extends string, Plugins extends ASP<Channels, any>>(
  ch: Channels,
  fullPlugin: Plugins
) => MergePlugins<
  Channels,
  {
    [K in keyof G]: ReturnType<G[K]>;
  }
> {
  return;
}

type PluginGenerator = <
  Channels extends string,
  Plugins extends AnyPlugin<Channels>,
>(
  ch: Channels[],
  fullPlugin: Plugins
) => ASP<Channels, Plugins>;

export const StreamAudioStdlib = <
  Channels extends string,
  Plugins extends AnyPlugin<Channels>,
>(
  ch: Channels[]
): StreamAudioStdlib<Channels, Plugins> => {
  function sameSignalOnData(
    builder: AudioStreamBuilder<Plugins, Channels>,
    duration: number,
    f: (time: number, sample: number) => number
  ) {
    return createSignal({
      builder,
      sampleRate: builder.defaultSampleRate,
      length: Math.ceil(duration * builder.defaultSampleRate),
      duration,
      constructors: arrayToObjKeys(builder.defaultChannels, () => f),
    });
  }
  return {
    global: {
      silence(builder, seconds: number) {
        return createSignal({
          builder,
          sampleRate: builder.defaultSampleRate,
          length: Math.ceil(seconds * builder.defaultSampleRate),
          duration: seconds,
          constructors: arrayToObjKeys(builder.defaultChannels, () => () => 0),
        });
      },

      waveform(
        builder,
        seconds: number,
        frequency: number,
        amplitude: number = 1,
        phase: number = 0,
        profile: (f: number) => number
      ) {
        return sameSignalOnData(builder, seconds, (t) => {
          return amplitude * profile((t / frequency + phase) % 1);
        });
      },

      sine(
        builder,
        seconds: number,
        frequency: number,
        amplitude: number = 1,
        phase: number = 0
      ) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => Math.sin(x * Math.PI * 2)
        );
      },

      square(
        builder,
        seconds: number,
        frequency: number,
        amplitude: number = 1,
        phase: number = 0
      ) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => (x > 0.5 ? -1 : 1)
        );
      },

      saw(
        builder,
        seconds: number,
        frequency: number,
        amplitude: number = 1,
        phase: number = 0
      ) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => x * 2.0 - 1.0
        );
      },

      combineAudio<
        Audio extends (Mono<EmptyPlugin> | AudioStream<Channels, Plugins>)[],
      >(
        builder,
        audio: Audio,
        f: (
          time: number,
          sample: number,
          ...xs: { [K in keyof Audio]: number }
        ) => {
          [K in keyof Channels]: (
            time: number,
            sample: number,
            ...xs: { [K in keyof Audio]: number }
          ) => number;
        }
      ): AudioStream<Channels, Plugins> {
        const duration = Math.max(...audio.map((a) => a.duration));
        const length = Math.ceil(duration * builder.defaultSampleRate);

        const stream = {
          _isAudioStream: true,
          duration,
          length,
          sampleRate: builder.defaultSampleRate,
          async getRange(start, count) {
            const ranges: Record<string, Float32Array>[] = await Promise.all(
              audio.map(async (a) =>
                mapObjValues(
                  await getRangeAndResample(
                    a as AudioStream<string, EmptyPlugin>,
                    start,
                    count,
                    builder.defaultSampleRate
                  ),
                  (k, v) => new Float32Array(v)
                )
              )
            );

            return (builder.defaultChannels as Channels[]).map((d) => {
              const combinedChannel = new Float32Array(count);

              return range(count).map((i) => {
                const samples = ranges.map((r) => {
                  return r[d][i];
                });

                return f(
                  (start + i) / builder.defaultSampleRate,
                  start + i,
                  // @ts-expect-error
                  ...samples
                );
              });
            });
          },
          getRangeByChannel(start, count, channel) {
            return this.getRange(start, count)[channel];
          },
        } as unknown as AudioStream<Channels, Plugins>;

        for (const [k, l] of Object.entries(builder.plugins.local)) {
          // @ts-expect-error
          stream[k] = (...args) => l(stream, ...args);
        }

        return stream;
      },
    },
    local: {},
  };
};

const g = mergePluginGenerators(StreamAudioStdlib);

//  g();
