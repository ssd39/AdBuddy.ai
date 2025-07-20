import { useDaily } from "@daily-co/daily-react";
import { useCallback } from "react";

export const useCVICall = (): {
  joinCall: (props: { url: string }) => void;
  leaveCall: () => void;
} => {
  const daily = useDaily();

  const joinCall = useCallback(
    ({ url }: { url: string }) => {
      daily?.join({
        url: url,
        inputSettings: {
          audio: {
            processor: {
              type: "noise-cancellation",
            },
          },
        },
      });
    },
    [daily]
  );

  const leaveCall = useCallback(() => {
    daily?.leave();
  }, [daily]);

  return { joinCall, leaveCall };
};
