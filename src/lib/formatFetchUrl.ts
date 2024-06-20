export const formatFetchUrl = (url: string): string => {
  const base_url = process.env.NEXT_URL || "http://localhost:3000";
  return `${base_url}${url}`;
};
