import type {
  PostReactionType,
  PostReactionSummaryItem,
  PostReactions,
} from "@/types/social.type";

export const updateReactionSummary = (summary: PostReactionSummaryItem[], newType: PostReactionType, oldType: PostReactionType | null): PostReactionSummaryItem[] => {
  const updated = summary.map((item) => ({ ...item }));

  if (oldType && oldType !== newType) {
    const oldIdx = updated.findIndex((i) => i.type === oldType);
    if (oldIdx !== -1) {
      if (updated[oldIdx]!.count > 1) updated[oldIdx]!.count--;
      else updated.splice(oldIdx, 1);
    }
  }

  const newIdx = updated.findIndex((i) => i.type === newType);

  if (newIdx !== -1) updated[newIdx]!.count++;
  else updated.push({ type: newType, count: 1 });

  return updated.sort((a, b) => b.count - a.count).slice(0, 3);
};

export const removeFromReactionSummary = (summary: PostReactionSummaryItem[], type: PostReactionType): PostReactionSummaryItem[] => {
  const updated = summary.map((item) => ({ ...item }));

  const idx = updated.findIndex((i) => i.type === type);

  if (idx !== -1) {
    if (updated[idx]!.count > 1) updated[idx]!.count--;
    else updated.splice(idx, 1);
  }

  return updated.sort((a, b) => b.count - a.count);
};

export const snapshotReactions = (reactions: PostReactions): PostReactions => {
  return { ...reactions, summary: reactions.summary.map((i) => ({ ...i })) };
};