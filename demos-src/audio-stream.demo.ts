// import { download } from "../src";
import { createTrackSpec, note2freq, parseNotes, range } from "../src";
import {
  AudioBuilder,
  createTrack,
  displayAudio,
  initBufferStreamerWorklet,
  isWorklet,
  streamAudioToWorklet,
} from "../src/audio/stream-audio";

const initWorklet = initBufferStreamerWorklet("audio-stream.demo.js");

if (!isWorklet()) {
  (async () => {
    const a = new AudioBuilder(["left", "right"] as const, 44100);
    const m = new AudioBuilder(["center"] as const, 44100);

    const adsr = m.adsrgen(1, 0.2, 0.2, 0);

    const adsrn =
      (a: number, d: number, s: number, r: number) => (len: number) =>
        adsr(a * len, d * len, s * len, r * len);

    const KERNSIZE = 100;

    // const w = createTrack(
    //   ["left", "right"],
    //   44100,
    //   range(12).map((i) => ({
    //     start: i * 0.5,
    //     audio: a
    //       .sine(440 * Math.pow(2, i / 12), 0.5)
    //       .clip(0, 2)
    //       .gain(adsr(0.1, 0.2, 1, 2)),
    //   }))
    // );
    // const track = parseNotes("c4 2 2 1 2 2 2 1 0/4/7");
    // const track = parseNotes("c1 c2 c3 c4 c5 c6 c7 c8");

    const clap = (freq: number, duration: number) =>
      a
        .noise()
        .convolve(a.lpf(freq * 2, 32))
        .gain(m.constant(400 / Math.log(freq) ** 3))
        .clip(0, 0.05)
        .gain(adsr(0, 0.005, 0.025, 0.05));

    const melody = (freq: number, duration: number) => {
      console.log("duration", duration);
      return a
        .sine(freq)
        .gain(m.constant(0.5))
        .add(a.square(freq * 0.5).gain(m.constant(0.2)))
        .clip(0, duration)
        .gain(adsrn(0.1, 0.3, 0.6, 1)(duration));
    };

    const track = parseNotes(`
      4:(
      c4 3 4  
      c4 3 4  
      c4 3 4  
      c4 3 4  
      c4 3 4  
      c4
      )/c2

      4:(
      b4 4 4
      b4 4 4
      b4 4 4
      b4 4 4
      b4 4 4
      b4
      )/b2

      4:(
      bb4 5 4
      bb4 5 4
      bb4 5 4
      bb4 5 4
      bb4 5 4
      bb4
      )/bb2
      `);

    console.log(track);

    const trackSpec = createTrackSpec(track, 120, melody);

    const w = a.createTrack(trackSpec).preload();

    // const w = a.sine(440, 0.5).clip(0, 2);

    // const w = a
    //   .noise(0.0)
    //   .add(a.sine(110, 0.1))
    //   .add(a.sine(440, 0.1))
    //   .add(a.sine(440 * 4, 0.1))
    //   .add(a.sine(440 * 16, 0.1))
    //   .add(a.square(110, 0.5))
    //   .clip(0, 5)
    //   .convolve(m.square(0.01, 1 / KERNSIZE).clip(0, (1 / 44100) * KERNSIZE));
    // .clip(0, 0.1);

    // download(await getOgg(w), "asdasdasd.wav");

    // for (const c of await displayAudio(a.lpf(700, 16)))
    //   document.body.appendChild(c);

    for (const c of await displayAudio(w.clip(0, 4), 1, [4000, 100], 1)) {
      document.body.appendChild(c);
    }

    document.onclick = async () => {
      const ctx = new AudioContext();
      const createWorklet = await (await initWorklet)(ctx);
      const bufferStreamer = createWorklet();

      streamAudioToWorklet(w, bufferStreamer);

      const osc = new OscillatorNode(ctx);
      osc.connect(bufferStreamer.worklet).connect(ctx.destination);
      osc.start();
    };
  })();
}
