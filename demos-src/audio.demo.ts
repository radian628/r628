import {
  add,
  adsr,
  constant,
  convolve,
  envelope,
  getOgg,
  graphAudio,
  modulateGain,
  play,
  saw,
  scaleDuration,
  signal,
  silence,
  sine,
  square,
} from "../src/audio/audio";
import { download } from "../src/download";
import { range } from "../src/range";

const track = silence(6);
// range(2).map((i) => {
//   add(track, sine(3, 520.1 * i, 0.03), i * 1 + 1);
// });
// const reverbed = convolve(
//   track,
//   signal(1, (x) => ((x * 44100) % 1000 < 1.1 ? 1 : 0))
// );

// const reverbed = track;

const impulseRes = add(
  silence(6),
  signal(3, (x, i) => (i % 1400 === 0 ? (x / 3) ** 4 * 0.1 : 0)),
  0
);

range(13).map((i) => {
  add(
    track,
    modulateGain(
      sine(0.25, 440 * 2 ** (i / 12), 0.5),
      scaleDuration(adsr(0.1, 0.1, 0.7, 0.1), 0.25)
    ),
    0 + i * 0.2
  );
});
// add(track, constant(1, 0.003), 1);
// const reverbed = add(track, convolve(track, impulseRes));
const reverbed = convolve(track, impulseRes);
// const reverbed = track;

document.body.appendChild(graphAudio(reverbed, 1000, 200));

(async () => {
  // download(await getOgg(reverbed), "audio.ogg");
})();

document.addEventListener("click", () => {
  console.log("playing");
  play(reverbed);
  setTimeout(() => {
    console.log("one second");
  }, 1000);
});
