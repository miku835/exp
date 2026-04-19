import type { Experiment } from "@workspace/api-client-react";

export interface SearchResult {
  experiments: Experiment[];
  detectedSubject: string | null;
  keywords: string[];
}

const STOP_WORDS = new Set(["exp", "experiment", "experiments", "in", "from", "about", "the", "a", "an"]);

export function parseSearchQuery(query: string, subjects: string[]): {
  detectedSubject: string | null;
  keywords: string[];
} {
  const subjectsLower = subjects.map((s) => s.toLowerCase());
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  let detectedSubject: string | null = null;
  const remainingKeywords: string[] = [];

  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue;
    const subjectIndex = subjectsLower.indexOf(token);
    if (subjectIndex !== -1 && !detectedSubject) {
      detectedSubject = subjects[subjectIndex];
    } else {
      remainingKeywords.push(token);
    }
  }

  return { detectedSubject, keywords: remainingKeywords };
}

export function smartSearch(
  experiments: Experiment[],
  query: string,
  sidebarSubject: string | null,
  subjects: string[]
): SearchResult {
  if (!query.trim() && !sidebarSubject) {
    return { experiments, detectedSubject: null, keywords: [] };
  }

  const { detectedSubject: querySubject, keywords } = parseSearchQuery(query, subjects);

  const effectiveSubject = sidebarSubject ?? querySubject;

  let filtered = experiments;

  if (effectiveSubject) {
    filtered = filtered.filter(
      (e) => e.subject.toLowerCase() === effectiveSubject.toLowerCase()
    );
  }

  if (keywords.length > 0) {
    filtered = filtered.filter((e) => {
      const haystack = [e.title, e.description, e.code, e.subject]
        .join(" ")
        .toLowerCase();
      return keywords.every((kw) => haystack.includes(kw));
    });
  }

  return { experiments: filtered, detectedSubject: effectiveSubject, keywords };
}

const RECENT_SEARCHES_KEY = "explib_recent_searches";
const MAX_RECENT = 6;

export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (!query.trim() || query.trim().length < 2) return;
  try {
    const current = getRecentSearches();
    const updated = [
      query.trim(),
      ...current.filter((q) => q.toLowerCase() !== query.trim().toLowerCase()),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}

export function getSuggestions(
  query: string,
  experiments: Experiment[],
  subjects: string[]
): string[] {
  if (!query.trim() || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const suggestions = new Set<string>();

  for (const subject of subjects) {
    if (subject.toLowerCase().includes(q)) {
      suggestions.add(subject);
    }
  }

  for (const exp of experiments) {
    if (exp.title.toLowerCase().includes(q)) {
      suggestions.add(exp.title);
    }
  }

  return Array.from(suggestions).slice(0, 6);
}
