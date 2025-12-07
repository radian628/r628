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
    const track = parseNotes(`
    // (c2 c2)/(c3 c3 c3) 
    // (c2 c2)/(c3 c3 c3) 
    // (c2 c2)/(c3 c3 c3) 
    // (c2 c2)/(c3 c3 c3) 
    // (c2 c2)/(c3 c3 c3) 
    // (c2 c2)/(c3 c3 c3) 
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      (3:c5 3:c5 2:c5)/(c2 c2 c2 c2 c2 c2)
      `);

    const trackSpec = createTrackSpec(track, 120, (freq, duration) =>
      // a
      //   .sine(freq, 0.4)
      //   .clip(0, duration)
      //   .gain(adsr(duration * 0.1, duration * 0.2, duration * 0.5, duration))

      a
        .noise()
        // .sine(freq)
        // .convolve(a.boxcar(1 / freq))
        .convolve(a.lpf(freq * 2, 32))
        .gain(m.constant(400 / Math.log(freq) ** 3))
        // .add(a.square(freq).gain(a.constant(0.1)))
        .clip(0, 0.05)
        .gain(adsr(0, 0.005, 0.025, 0.05))
    );

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
