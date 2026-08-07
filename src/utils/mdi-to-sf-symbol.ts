const map: Record<string, string> = {
  "mdi-run": "figure.run",
  "mdi-hiking": "figure.hiking",
  "mdi-shoe-print": "figure.walk",
  "mdi-bike": "figure.outdoor.cycle",
  "mdi-run-fast": "figure.run.treadmill"
};

export const mdiToSfSymbol = (icon?: string): string => (icon && map[icon]) || "figure.run";