import React from "react";
import EventEmitter from "./eventEmitter";

export function ErrorSignal() {
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    Errors.on("error", () => {
      setError(true);
    });
  }, []);
  return error ? (
    <div
      style={{
        height: "10px",
        width: "10px",
        bottom: 10,
        right: 10,
        position: "fixed",
        borderRadius: "100%",
        background: "red",
        title: "An error ocurred",
        zIndex: 150000,
      }}
    ></div>
  ) : (
    <></>
  );
}

export const Errors = new (class extends EventEmitter<{
  error: undefined;
}> {})();

export function handleError(error: any, source: string, description: string) {
  console.error(`Error ocurred in ${source} with description "${description}"`);
  console.error(error);
  Errors.emit("error", undefined);
}
