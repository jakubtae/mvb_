export const apiCreate = (url: string): string => {
  const base_url = process.env.BACKEND_URL || "http://localhost:50";
  return `${base_url}${url}`;
};
