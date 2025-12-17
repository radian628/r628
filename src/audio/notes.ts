import {
  alt_sc,
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  kleft,
  kmid,
  lrec_sc,
  nil,
  Parser,
  rep_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { AudioStream, TrackSpec } from "./stream-audio";

type Track = Note[];

type Timing = number | undefined;

type Note =
  | {
      timing: Timing;
      type: "compound";
      notes: Note[];
    }
  | {
      timing: Timing;
      type: "chord";
      notes: Note[];
    }
  | {
      timing: Timing;
      type: "note";
      noteData: string;
    };

enum TokenKind {
  Open,
  Close,
  Colon,
  Slash,
  Whitespace,
  Integer,
  ChromaticKey,
  Comment,
}

const noteLexer = buildLexer([
  [true, /^\(/g, TokenKind.Open],
  [true, /^\)/g, TokenKind.Close],
  [true, /^\:/g, TokenKind.Colon],
  [true, /^\//g, TokenKind.Slash],
  [false, /^\s+/g, TokenKind.Whitespace],
  [false, /^\/\/[^\n]*/g, TokenKind.Comment],
  [true, /^(\+|\-)?[0-9]+/g, TokenKind.Integer],
  [true, /^[a-gA-G][b#]*[0-9]*/g, TokenKind.ChromaticKey],
]);

const note_timing: Parser<TokenKind, Timing> = alt_sc(
  apply(kleft(tok(TokenKind.Integer), str(":")), (t) => Number(t.text)),
  apply(nil(), () => 1)
);

const primitive_note: Parser<TokenKind, Note> = apply(
  seq(note_timing, alt_sc(tok(TokenKind.ChromaticKey), tok(TokenKind.Integer))),
  ([timing, note]) => ({
    type: "note",
    timing,
    noteData: note.text,
  })
);

const chord_inner = rule<TokenKind, Note>();

const chord: Parser<TokenKind, Note> = apply(
  seq(
    note_timing,
    lrec_sc(
      apply(chord_inner, (x) => [x]),
      seq(str("/"), chord_inner),
      (a: Note[], [_, b]) => [...a, b]
    )
  ),
  ([timing, notes]) => ({
    type: "chord",
    timing,
    notes,
  })
);

const compound_note = rule<TokenKind, Note>();

const compound_note_inner: Parser<TokenKind, Note[]> = rep_sc(
  alt_sc(primitive_note, chord, compound_note)
);

compound_note.setPattern(
  apply(
    seq(note_timing, kmid(str("("), compound_note_inner, str(")"))),
    ([timing, notes]) => ({ type: "compound", timing, notes })
  )
);

chord_inner.setPattern(alt_sc(primitive_note, compound_note));

const note = alt_sc(chord, compound_note, primitive_note);

const track: Parser<TokenKind, Track> = rep_sc(note);

export function parseNotes(src: string) {
  const tokens = noteLexer.parse(src);

  return expectSingleResult(expectEOF(track.parse(tokens)));
}

type Patch<Channels extends string> = (
  freq: number,
  duration: number
) => AudioStream<Channels>;

export function getBeatCount(notes: Note[]) {
  return notes.reduce((p, c) => p + c.timing, 0);
}

export function createTrackSpecForNoteSequence(
  startTime: number,
  duration: number,
  notes: Note[],
  lastFreq: number,
  patch: Patch<"left" | "right">
): {
  freq: number;
  trackSpec: TrackSpec<"left" | "right">;
} {
  let time = startTime;
  let freq = lastFreq;
  let spec: TrackSpec<"left" | "right"> = [];

  const timingTotal = getBeatCount(notes);

  for (const n of notes) {
    const thisNoteDuration = (duration * n.timing) / timingTotal;
    const data = createTrackSpecForNote(time, thisNoteDuration, n, freq, patch);

    spec.push(...data.trackSpec);

    time += thisNoteDuration;
    freq = data.freq;
  }

  return {
    freq,
    trackSpec: spec,
  };
}

export function createTrackSpecForNote(
  startTime: number,
  duration: number,
  note: Note,
  lastFreq: number,
  patch: Patch<"left" | "right">
): {
  freq: number;
  trackSpec: TrackSpec<"left" | "right">;
} {
  if (note.type === "note") {
    const freq = note2freq(note.noteData, lastFreq);

    return {
      freq,
      trackSpec: [
        {
          start: startTime,
          audio: patch(freq, duration),
        },
      ],
    };
  } else if (note.type === "chord") {
    const results = note.notes.map((n) =>
      createTrackSpecForNote(startTime, duration * n.timing, n, lastFreq, patch)
    );

    return {
      freq: results.at(-1)!.freq,
      trackSpec: results.flatMap((x) => x.trackSpec),
    };
  } else if (note.type === "compound") {
    return createTrackSpecForNoteSequence(
      startTime,
      duration,
      note.notes,
      lastFreq,
      patch
    );
  }
}

export function createTrackSpec(
  track: Track,
  bpm: number,
  patch: Patch<"left" | "right">
): TrackSpec<"left" | "right"> {
  return createTrackSpecForNoteSequence(
    0,
    (getBeatCount(track) * 60) / bpm,
    track,
    440,
    patch
  ).trackSpec;
}

export function note2freq(note: string, lastfreq?: number) {
  if (note[0].match(/[a-gA-G]/g)) {
    let semitone = {
      a: 0,
      b: 2,
      c: 3,
      d: 5,
      e: 7,
      f: 8,
      g: 10,
    }[note[0].toLowerCase()] as number;

    let i;
    for (i = 1; note[i] === "b" || note[i] === "#"; i++) {
      semitone += note[i] === "#" ? 1 : -1;
    }

    let octave = parseInt(note.slice(i));
    if (isNaN(octave)) octave = 4;

    semitone += (octave - 4) * 12;

    return Math.pow(2, semitone / 12) * 440;
  } else {
    return (lastfreq ?? 440) * Math.pow(2, parseInt(note) / 12);
  }
}
