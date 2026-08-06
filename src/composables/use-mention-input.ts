import { Fetcher } from "@/plugins/Fetcher";
import { type MentionUser } from "@/types/social.type";
import { type Ref } from "vue";

export const useMentionInput = (textModel: Ref<string>) => {
  const mentionQuery = ref<string | null>(null);
  const mentionResults = ref<MentionUser[]>([]);
  const isSearchingMentions = ref(false);
  const mentionStartIndex = ref(0);
  const selectedIndex = ref(-1);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const searchMentions = async (q: string) => {
    isSearchingMentions.value = true;

    try {
      const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}social/mention-search?q=${encodeURIComponent(q)}&limit=10`, { method: "GET" });
      if (!response.error) mentionResults.value = response.json.results;
    } finally {
      isSearchingMentions.value = false;
    }
  };

  const onInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    if (!target || !("selectionStart" in target)) return;

    const pos = target.selectionStart ?? target.value.length;
    const text = target.value;

    let i = pos - 1;

    while (i >= 0) {
      const ch = text[i]!;

      if (ch === "@") {
        const query = text.slice(i + 1, pos);

        if (!/[\s\n]/.test(query)) {
          mentionStartIndex.value = i;
          mentionQuery.value = query;
          selectedIndex.value = -1;

          if (debounceTimer) clearTimeout(debounceTimer);

          if (query.length >= 1) {
            isSearchingMentions.value = true;
            debounceTimer = setTimeout(() => searchMentions(query), 250);
          } else {
            mentionResults.value = [];
            isSearchingMentions.value = false;
          }
          return;
        }
        break;
      }

      if (ch === " " || ch === "\n") break;
      i--;
    }

    mentionQuery.value = null;
    mentionResults.value = [];
    isSearchingMentions.value = false;
    if (debounceTimer) clearTimeout(debounceTimer);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (mentionQuery.value === null) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, mentionResults.value.length - 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
        break;
      case "Enter":
        if (selectedIndex.value >= 0 && mentionResults.value[selectedIndex.value]) {
          event.preventDefault();
          selectMention(mentionResults.value[selectedIndex.value]!);
        }
        break;
      case "Tab":
        if (mentionResults.value.length > 0) {
          event.preventDefault();
          const idx = selectedIndex.value >= 0 ? selectedIndex.value : 0;
          selectMention(mentionResults.value[idx]!);
        }
        break;
      case "Escape":
        event.preventDefault();
        mentionQuery.value = null;
        mentionResults.value = [];
        selectedIndex.value = -1;
        break;
    }
  };

  const selectMention = (user: MentionUser) => {
    const before = textModel.value.slice(0, mentionStartIndex.value);
    const after = textModel.value.slice(
      mentionStartIndex.value + 1 + (mentionQuery.value?.length ?? 0)
    );
    textModel.value = `${before}@${user.username} ${after}`;
    mentionQuery.value = null;
    mentionResults.value = [];
    selectedIndex.value = -1;
    if (debounceTimer) clearTimeout(debounceTimer);
  };

  return {
    mentionQuery,
    mentionResults,
    isSearchingMentions,
    mentionStartIndex,
    selectedIndex,
    onInput,
    onKeydown,
    selectMention,
  };
};