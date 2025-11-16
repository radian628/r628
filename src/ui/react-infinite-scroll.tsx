import React, { useEffect, useRef, useState } from "react";

export function useAsyncSequence<T>(
  callback: (seq: T) => Promise<(t: T) => T>,
  init: T,
  dependencies: any[]
) {
  const [seq, setSeq] = useState<T>(init);

  const batchIndex = useRef(0);

  const isRunning = useRef(true);

  useEffect(() => {
    let isLoopCurrent = true;
    batchIndex.current += 1;
    const thisBatch = batchIndex.current;

    let seqTemp = init;
    setSeq(init);

    const f = async () => {
      if (isRunning.current) {
        if (!isLoopCurrent) return;

        const res = await callback(seqTemp);

        if (!isLoopCurrent) return;

        if (batchIndex.current === thisBatch) {
          seqTemp = res(seqTemp);
          setSeq(seqTemp);
        }
      } else if (!isLoopCurrent) {
        return;
      }

      setTimeout(f);
    };

    f();

    return () => {
      isLoopCurrent = false;
    };
  }, dependencies);

  return {
    seq,
    isRunning: isRunning,
  };
}

export function useInfiniteScroll<T>(props: {
  getMore: (pageIndex: number) => Promise<T[]>;
  done: (
    pageIndex: number,
    items: T[],
    lastBatch: T[] | undefined
  ) => Promise<boolean>;
  rootMargin?: string;
  dependencies: any[];
}) {
  const itemsLoaded = useAsyncSequence<{
    items: T[];
    index: number;
    done: boolean;
  }>(
    async (s) => {
      if (s.done) {
        return (s) => s;
      }

      const more = await props.getMore(s.index);
      const done = await props.done(s.index, s.items, more);
      return (s) => {
        if (done) {
          return { ...s, done: true };
        } else {
          return {
            items: s.items.concat(more),
            index: s.index + 1,
            done: false,
          };
        }
      };
    },
    { index: 0, items: [], done: false },
    [...props.dependencies]
  );

  return {
    items: itemsLoaded.seq.items,
    index: itemsLoaded.seq.index,
    done: itemsLoaded.seq.done,
    ScrollDetector: () => {
      return (
        <div
          ref={(e) => {
            if (!e) return;

            const observer = new IntersectionObserver(
              (e) => {
                itemsLoaded.isRunning.current =
                  e.at(-1)?.isIntersecting ?? true;
              },
              {
                rootMargin: props.rootMargin,
              }
            );
            observer.observe(e);

            return () => {
              observer.disconnect();
            };
          }}
        ></div>
      );
    },
  };
}
