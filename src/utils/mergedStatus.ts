import { useState } from "react";

type StateUpdater<State> = (prevState: State) => Partial<State>;

export function useMergedState<State extends Record<string, any>>(
  initialState: State,
  debug = false
): [
  State,
  (mergeState: Partial<State> | StateUpdater<State>) => void,
  (state: State) => void
] {
  const [state, setState] = useState<State>(initialState);

  function mergeState(newState: StateUpdater<State> | Partial<State>) {
    if (debug) console.log(newState);

    setState((prevState) => {
      if (typeof newState === "function") {
        newState = newState(prevState);
      }
      return { ...prevState, ...newState };
    });
  }

  return [state, mergeState, setState];
}
