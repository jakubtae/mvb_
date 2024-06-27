"use client";

import { useEffect, useState } from "react";

export const useCountdown = (
  initialTime: number,
  callback: () => void,
  interval = 1000
) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (time <= 0) {
      callback();
      return;
    }

    const customInterval = setInterval(() => {
      setTime((prev) => Math.max(prev - interval, 0));
    }, interval);

    return () => clearInterval(customInterval);
  }, [time, interval, callback]);

  return time;
};
