export const youtube = () => {
  const extractId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const extractTime = (url: string) => {
    try {
      const parsedUrl = new URL(url);

      const time = parsedUrl.searchParams.get("t");

      if (!time) return 0;

      // Caso venha apenas número: ?t=5709
      if (/^\d+$/.test(time)) return Number(time);

      // Caso venha no formato 1h2m3s
      const match = time.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);

      if (!match) return 0;

      const [, hours, minutes, seconds] = match;

      return (
        (Number(hours) || 0) * 3600 +
        (Number(minutes) || 0) * 60 +
        (Number(seconds) || 0)
      );
    } catch {
      return 0;
    }
  };

  return { extractId, extractTime };
};