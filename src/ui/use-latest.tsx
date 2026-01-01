import { useEffect, useRef } from "react";

export function useLatest<T>(t: T) {
  const tref = useRef<T>(t);

  useEffect(() => {
    tref.current = t;
  }, [t]);

  return tref;
}
