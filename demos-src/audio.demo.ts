import {
  add,
  adsr,
  constant,
  convolve,
  envelope,
  getOgg,
  graphAudio,
  modulateGain,
  modulateSampleTime,
  play,
  resample,
  saw,
  scaleDuration,
  signal,
  silence,
  sine,
  square,
} from "../src/audio/audio";
import { download } from "../src/download";
import { range } from "../src/range";

// const track = silence(6);
// // range(2).map((i) => {
// //   add(track, sine(3, 520.1 * i, 0.03), i * 1 + 1);
// // });
// // const reverbed = convolve(
// //   track,
// //   signal(1, (x) => ((x * 44100) % 1000 < 1.1 ? 1 : 0))
// // );

// // const reverbed = track;

// const impulseRes = add(
//   silence(6),
//   signal(3, (x, i) => (i % 1400 === 0 ? (x / 3) ** 4 * 0.1 : 0)),
//   0
// );

// range(13).map((i) => {
//   add(
//     track,
//     modulateGain(
//       sine(0.25, 440 * 2 ** (i / 12), 0.5),
//       scaleDuration(adsr(0.1, 0.1, 0.7, 0.1), 0.25)
//     ),
//     0 + i * 0.2
//   );
// });
// // add(track, constant(1, 0.003), 1);
// // const reverbed = add(track, convolve(track, impulseRes));
// const reverbed = convolve(track, impulseRes);
// // const reverbed = track;

// document.body.appendChild(graphAudio(reverbed, 1000, 200));

// (async () => {
//   // download(await getOgg(reverbed), "audio.ogg");
// })();

// document.addEventListener("click", () => {
//   console.log("playing");
//   play(reverbed);
//   setTimeout(() => {
//     console.log("one second");
//   }, 1000);
// });

const track = silence(20);

for (const i of range(40)) {
  const bass = square(0.2, 55 * Math.pow(2, i / 12), 1);
  modulateGain(bass, sine(0.2, 20, 0.5));
  modulateGain(bass, adsr(0.05, 0.05, 0.05, 0.05));

  add(track, bass, i * 0.4);
}

// const patch = sine(0.15, 440, 0.5);

// for (const i of range(20)) {
//   add(track, patch, i * 0.4);
//   // modulateSampleTime(
//   //   patch,
//   //   signal(0.15, (t) => t + Math.cos(100 * t) * 0.0001)
//   // );
// }

document.body.appendChild(graphAudio(track, 1000, 200));

document.addEventListener("click", () => {
  play(track);
});
