export type Evalbox = {
  iframe: HTMLIFrameElement;
  eval(str: string): Promise<
    | {
        success: true;
        data: any;
      }
    | { success: false; error: string }
  >;
  kill(): void;
  reload(): Promise<void>;
};

function createEvalbox(): Promise<Evalbox> {
  const evalbox = document.createElement("iframe");
  evalbox.sandbox = "allow-scripts";
  let index = 0;
  return new Promise((resolve, reject) => {
    const initLoadListener = () => {
      evalbox.removeEventListener("load", initLoadListener);
      resolve({
        iframe: evalbox,
        eval(str: string) {
          return new Promise((resolve, reject) => {
            let myindex = index++;
            const listener = (e: MessageEvent) => {
              if (e.data && e.data.id === myindex) {
                resolve(
                  e.data.type === "eval-success"
                    ? {
                        data: e.data.payload,
                        success: true,
                      }
                    : {
                        success: false,
                        error:
                          typeof e.data.payload === "string"
                            ? e.data.payload
                            : "No Error Provided",
                      }
                );
                window.removeEventListener("message", listener);
              }
            };

            window.addEventListener("message", listener);
            evalbox.contentWindow?.postMessage(
              {
                id: myindex,
                payload: str,
                type: "eval",
              },
              "*"
            );
          });
        },
        kill() {
          document.body.removeChild(evalbox);
        },
        reload() {
          return new Promise((resolve, reject) => {
            const refreshListener = () => {
              evalbox.removeEventListener("load", refreshListener);
              resolve();
            };
            evalbox.addEventListener("load", refreshListener);
            evalbox.contentWindow?.location.reload();
          });
        },
      });
    };
    evalbox.addEventListener("load", initLoadListener);
    evalbox.style.display = "none";
    document.body.appendChild(evalbox);
    evalbox.srcdoc = `
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script>
      window.addEventListener("message", async (e) => {
        if (e.data && e.data.type === "eval") {
          try {
            const res = await eval(e.data.payload);
            e.source.postMessage({
              type: "eval-success",
              payload: res,
              id: e.data.id
            }, "*");
          } catch (err) {
            e.source.postMessage({
              type: "eval-fail",
              payload: err.toString(),
              id: e.data.id
            }, "*"); 
          }
        }
      });
    </script> 
  </body>
</html>
`;
  });
}
