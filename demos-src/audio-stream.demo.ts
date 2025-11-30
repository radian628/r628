import {
  AudioBuilder,
  initBufferStreamerWorklet,
  isWorklet,
  playStereo,
  streamAudioToWorklet,
} from "../src/audio/stream-audio";

const a = new AudioBuilder(["left", "right"] as const, 44100);

const w = a.saw(4, 440, 0.1, 0);

// const worklet = createAudioStreamWorklet(w, "audio-stream.demo.js", "worklet");

const initWorklet = initBufferStreamerWorklet("audio-stream.demo.js");

if (!isWorklet()) {
  document.onclick = async () => {
    const ctx = new AudioContext();
    const createWorklet = await (await initWorklet)(ctx);
    const bufferStreamer = createWorklet();

    streamAudioToWorklet(w, bufferStreamer);

    // const data = await w.getRange(0, 100000);

    // bufferStreamer.pushData(
    //   new Float32Array(data.left),
    //   new Float32Array(data.right)
    // );
    const osc = new OscillatorNode(ctx);
    osc.connect(bufferStreamer.worklet).connect(ctx.destination);
    osc.start();
  };
}
