import { fftConvolution } from "ml-convolution";
import { clamp, lerp, rescale } from "../interpolation";
import { range } from "../range";
import {
  AudioSample,
  AudioSampleSource,
  BufferTarget,
  Mp3OutputFormat,
  OggInputFormat,
  OggOutputFormat,
  Output,
} from "mediabunny";

export type Audio<Channels extends number = 2> = {
  channels: Float32Array<ArrayBuffer>[];
  sampleRate: number;
};

export function monoToStereo(mono: Audio<1>): Audio<2> {
  return {
    sampleRate: mono.sampleRate,
    channels: [mono.channels[0], new Float32Array(mono.channels[0])],
  };
}

export function signal(
  duration: number,
  f: (time: number, i: number) => number,
  sampleRate: number = 44100
): Audio<2> {
  const data = new Float32Array(
    range(duration * sampleRate).map((x) => f(x / sampleRate, x))
  );
  return {
    sampleRate,
    channels: [data, new Float32Array(data)],
  };
}

export function envelope(
  duration: number,
  f: (fraction: number) => number,
  sampleRate: number = 44100
): Audio<2> {
  return signal(duration, (x) => f(x / duration), sampleRate);
}

export function sine(
  duration: number,
  freq: number,
  amp: number,
  phase: number = 0,
  sampleRate: number = 44100
): Audio<2> {
  return signal(
    duration,
    (x) => Math.sin((x - phase) * Math.PI * 2 * freq) * amp
  );
}

export function square(
  duration: number,
  freq: number,
  amp: number,
  phase: number = 0,
  sampleRate: number = 44100
): Audio<2> {
  return signal(duration, (x) =>
    ((x + 1 - (phase % 1)) % (1 / freq)) * 2 * freq > 1 ? -amp : amp
  );
}

export function saw(
  duration: number,
  freq: number,
  amp: number,
  phase: number = 0,
  sampleRate: number = 44100
): Audio<2> {
  return signal(
    duration,
    (x) => (((x + 1 - (phase % 1)) % (1 / freq)) * freq * 2 - 1) * amp
  );
}

export function silence(
  duration: number,
  sampleRate: number = 44100
): Audio<2> {
  return constant(duration, 0, sampleRate);
}

export function constant(
  duration: number,
  c: number,
  sampleRate: number = 44100
): Audio<2> {
  const data = new Float32Array(range(duration * sampleRate).map(() => c));
  return {
    sampleRate,
    channels: [data, new Float32Array(data)],
  };
}

export function play(audio: Audio, audioContext?: AudioContext) {
  const actx = audioContext ?? new AudioContext();
  const buf = actx.createBuffer(
    audio.channels.length,
    audio.channels[0].length,
    audio.sampleRate
  );
  for (let i = 0; i < audio.channels.length; i++) {
    buf.copyToChannel(audio.channels[i], i, 0);
  }
  const source = actx.createBufferSource();
  source.buffer = buf;
  source.connect(actx.destination);
  source.start();
}

export function resample<Channels extends number = 2>(
  audio: Audio<Channels>,
  newSampleRate: number
): Audio<Channels> {
  let newSampleCount =
    (audio.channels[0].length / audio.sampleRate) * newSampleRate;
  let channels: Float32Array<ArrayBuffer>[] = [];
  for (const c of audio.channels) {
    channels.push(
      new Float32Array(
        range(newSampleCount).map((i) => {
          const oldIndex = clamp(
            (i / newSampleRate) * audio.sampleRate,
            0,
            audio.channels[0].length
          );
          const lo = Math.floor(oldIndex);
          const hi = Math.ceil(oldIndex);
          const frac = oldIndex % 1;
          return c[lo] * (1 - frac) + c[hi] * frac;
        })
      )
    );
  }
  return {
    sampleRate: newSampleRate,
    channels,
  };
}

export function modulateSampleTime(a: Audio, b: Audio) {
  if (b.sampleRate !== a.sampleRate) {
    b = resample(b, a.sampleRate);
  }

  for (let ci = 0; ci < a.channels.length; ci++) {
    const newChannel = new Float32Array(a.channels[ci].length);

    for (let i = 0; i < b.channels[ci].length; i++) {
      const index = Math.floor(b.channels[ci][i] * a.sampleRate);

      newChannel[i] =
        a.channels[ci][Math.min(Math.max(index, 0), a.channels[ci].length - 1)];
    }

    a.channels[ci] = newChannel;
  }

  return a;
}

// destructive to "a" for perf reasons
export function add<Channels extends number = 2>(
  a: Audio,
  b: Audio,
  offsetB: number = 0
) {
  if (b.sampleRate !== a.sampleRate) {
    b = resample(b, a.sampleRate);
  }

  const offsetSamples = Math.floor(offsetB * a.sampleRate);

  for (let ci = 0; ci < a.channels.length; ci++) {
    for (let i = 0; i < b.channels[ci].length; i++) {
      a.channels[ci][i + offsetSamples] += b.channels[ci][i];
    }
  }

  return a;
}

export function modulateGain(a: Audio, envelope: Audio, offsetB: number = 0) {
  if (envelope.sampleRate !== a.sampleRate) {
    envelope = resample(envelope, a.sampleRate);
  }

  const offsetSamples = Math.floor(offsetB * a.sampleRate);

  for (let ci = 0; ci < a.channels.length; ci++) {
    for (let i = 0; i < envelope.channels[ci].length; i++) {
      a.channels[ci][i + offsetSamples] *= envelope.channels[ci][i];
    }
  }

  return a;
}

export function adsr(
  a: number,
  d: number,
  s: number,
  r: number,
  ag: number = 1,
  dg: number = 0.5,
  sg: number = 0.5,
  rg: number = 0,
  sampleRate: number = 44100
) {
  const duration = a + d + s + r;
  return signal(
    duration,
    (x) => {
      if (x < a) {
        return rescale(x, 0, a, 0, ag);
      }
      if (x < a + d) {
        return rescale(x, a, a + d, ag, dg);
      }
      if (x < a + d + s) {
        return rescale(x, a + d, a + d + s, dg, sg);
      }
      return rescale(x, a + d + s, a + d + s + r, sg, rg);
    },
    sampleRate
  );
}

export function scaleDuration(
  a: Audio,
  duration: number,
  newSampleRate: number = 44100
): Audio {
  const sampleCount = duration * newSampleRate;
  const channels: Float32Array<ArrayBuffer>[] = [];
  for (const c of a.channels) {
    channels.push(
      new Float32Array(
        range(sampleCount).map((i) => {
          const idx = (i / newSampleRate / duration) * c.length;
          const lo = Math.floor(idx);
          const hi = Math.ceil(idx);
          return lerp(idx % 1, c[lo], c[hi]);
        })
      )
    );
  }
  return { channels, sampleRate: newSampleRate };
}

export function slice(a: Audio, start?: number, end?: number) {
  const lo = Math.floor(
    clamp((start ?? 0) / a.sampleRate, 0, a.channels[0].length - 1)
  );
  const hi = Math.ceil(
    clamp(
      (end ?? a.channels[0].length) / a.sampleRate,
      0,
      a.channels[0].length - 1
    )
  );

  return {
    sampleRate: a.sampleRate,
    channels: a.channels.map((c) => c.slice(lo, hi)),
  };
}

export function convolve(a: Audio, kernel: Audio) {
  return {
    channels: range(a.channels.length).map(
      (i) =>
        new Float32Array(
          fftConvolution(
            a.channels[i],
            kernel.channels[i].length % 2 == 0
              ? [...kernel.channels[i], 0]
              : kernel.channels[i]
          )
        )
    ),
    sampleRate: a.sampleRate,
  };
}

export function graphAudio(a: Audio, width: number, height: number) {
  const canvas = document.createElement("canvas");
  const channelWidth = width;
  const channelHeight = height / a.channels.length;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  let ci = 0;
  for (const c of a.channels) {
    ctx?.beginPath();
    let miny = channelHeight * ci;
    let maxy = channelHeight * (ci + 1);
    for (let i = 0; i < c.length; i++) {
      let x = (i / c.length) * width;
      let y = rescale(c[i], 1, -1, miny, maxy);
      ctx?.lineTo(x, y);
    }
    ctx?.stroke();
    ci++;
  }
  return canvas;
}

export async function getOgg(a: Audio) {
  const output = new Output({
    format: new OggOutputFormat(),
    target: new BufferTarget(),
  });

  const sample = new AudioSample({
    data: new Float32Array(a.channels.map((ch) => [...ch]).flat(1)),
    format: "f32-planar",
    numberOfChannels: 2,
    sampleRate: a.sampleRate,
    timestamp: 0,
  });

  const src = new AudioSampleSource({
    codec: "opus",
    bitrate: 128e3,
  });
  output.addAudioTrack(src);

  await output.start();
  await src.add(sample);
  await output.finalize();

  return new Blob([output.target.buffer!], { type: "audio/ogg" });
}
