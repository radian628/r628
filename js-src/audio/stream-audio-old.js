// src/interpolation.ts
function lerp(x, a, b) {
  return a * (1 - x) + b * x;
}

// src/object-utils.ts
function arrayToMapKeys(arr, f) {
  return new Map(arr.map((x) => [x, f(x)]));
}
function arrayToObjKeys(arr, f) {
  return map2obj(arrayToMapKeys(arr, f));
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

// src/audio/stream-audio-old.ts
function createAudioStreamBuilder(params) {
  const asb = { plugins: params.plugins };
  for (const [k, g2] of Object.entries(params.plugins.global)) {
    asb[k] = (...args) => g2(asb, ...args);
  }
  return asb;
}
function createSignal(params) {
  const constr = params.constructors;
  const constructors = constr instanceof Function ? arrayToObjKeys(
    params.builder.defaultChannels,
    (k) => (t, c) => constr(t, c)[k]
  ) : constr;
  const stream = {
    _isAudioStream: true,
    duration: params.duration,
    sampleRate: params.sampleRate,
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
          (s) => params.constructors[channel]((s + start) / this.sampleRate, s + start)
        )
      ).buffer;
    }
  };
  for (const [k, l] of Object.entries(params.builder.plugins.local)) {
    stream[k] = (...args) => l(stream, ...args);
  }
  return stream;
}
async function getRangeAndResample(stream, start, count, targetSampleRate) {
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
  const f32a = mapObjValues(
    r,
    (k, x) => new Float32Array(x)
  );
  return mapObjValues(f32a, (k, v) => {
    return new Float32Array(
      range(count).map((i) => {
        const rawIndex = (i + start) / targetSampleRate * stream.sampleRate;
        const prev = Math.floor(rawIndex);
        const next = prev + 1;
        return lerp(rawIndex % 1, v[prev], v[next]);
      })
    ).buffer;
  });
}
function mergePluginGenerators(...generators) {
  return;
}
var StreamAudioStdlib = (ch) => {
  function sameSignalOnData(builder, duration, f) {
    return createSignal({
      builder,
      sampleRate: builder.defaultSampleRate,
      length: Math.ceil(duration * builder.defaultSampleRate),
      duration,
      constructors: arrayToObjKeys(builder.defaultChannels, () => f)
    });
  }
  return {
    global: {
      silence(builder, seconds) {
        return createSignal({
          builder,
          sampleRate: builder.defaultSampleRate,
          length: Math.ceil(seconds * builder.defaultSampleRate),
          duration: seconds,
          constructors: arrayToObjKeys(builder.defaultChannels, () => () => 0)
        });
      },
      waveform(builder, seconds, frequency, amplitude = 1, phase = 0, profile) {
        return sameSignalOnData(builder, seconds, (t) => {
          return amplitude * profile((t / frequency + phase) % 1);
        });
      },
      sine(builder, seconds, frequency, amplitude = 1, phase = 0) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => Math.sin(x * Math.PI * 2)
        );
      },
      square(builder, seconds, frequency, amplitude = 1, phase = 0) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => x > 0.5 ? -1 : 1
        );
      },
      saw(builder, seconds, frequency, amplitude = 1, phase = 0) {
        return this.waveform(
          builder,
          seconds,
          frequency,
          amplitude,
          phase,
          (x) => x * 2 - 1
        );
      },
      combineAudio(builder, audio, f) {
        const duration = Math.max(...audio.map((a) => a.duration));
        const length = Math.ceil(duration * builder.defaultSampleRate);
        const stream = {
          _isAudioStream: true,
          duration,
          length,
          sampleRate: builder.defaultSampleRate,
          async getRange(start, count) {
            const ranges = await Promise.all(
              audio.map(
                async (a) => mapObjValues(
                  await getRangeAndResample(
                    a,
                    start,
                    count,
                    builder.defaultSampleRate
                  ),
                  (k, v) => new Float32Array(v)
                )
              )
            );
            return builder.defaultChannels.map((d) => {
              const combinedChannel = new Float32Array(count);
              return range(count).map((i) => {
                const samples = ranges.map((r) => {
                  return r[d][i];
                });
                return f(
                  (start + i) / builder.defaultSampleRate,
                  start + i,
                  ...samples
                );
              });
            });
          },
          getRangeByChannel(start, count, channel) {
            return this.getRange(start, count)[channel];
          }
        };
        for (const [k, l] of Object.entries(builder.plugins.local)) {
          stream[k] = (...args) => l(stream, ...args);
        }
        return stream;
      }
    },
    local: {}
  };
};
var g = mergePluginGenerators(StreamAudioStdlib);
export {
  StreamAudioStdlib,
  createAudioStreamBuilder,
  createSignal
};
