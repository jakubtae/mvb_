export const formatTime = (seconds: number): string => {
  const hours: number = Math.floor(seconds / 3600);
  const minutes: number = Math.floor((seconds % 3600) / 60);
  const remainingSeconds: number = seconds % 60;

  const formattedHours: string = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes: string = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds: string =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
