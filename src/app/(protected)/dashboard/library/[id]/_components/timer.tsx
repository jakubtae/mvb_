"use client";
import { useCountdown } from "@/hooks/useCountdown";
import { formatSecondsToHHMMSS } from "@/lib/timeRelated";
import { useRouter } from "next/navigation";

interface TimerProps {
  predictedTime: number;
}

export const Timer = ({ predictedTime }: TimerProps) => {
  const router = useRouter();
  const initialTime = predictedTime * 1000; // Convert to milliseconds
  const time = useCountdown(initialTime, () => router.refresh());
  return <>{formatSecondsToHHMMSS(time / 1000)}</>;
};
