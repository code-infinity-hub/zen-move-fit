import { type ContentSegment } from "@/types/global.type";

export const parseCommentContent = (
  text: string,
  mentions: { _id: string; username: string }[]
): ContentSegment[] => {
  const segments: ContentSegment[] = [];
  const regex = /@([a-zA-Z0-9_.]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const username = match[1]!;
    const mentioned = mentions.find((m) => m.username.toLowerCase() === username.toLowerCase());

    segments.push({ type: "mention", value: username, userId: mentioned?._id });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
};