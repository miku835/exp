import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useListExperiments, getListExperimentsQueryKey } from "@workspace/api-client-react";
import { Search, X, Clock, ChevronRight } from "lucide-react";
import { ExperimentCard } from "@/components/ExperimentCard";
import {
  smartSearch,
  getSuggestions,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "@/lib/smartSearch";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error } = useListExperiments({
    query: { queryKey: getListExperimentsQueryKey() },
  });

  const subjects = data?.subjects ?? [];
  const experiments = data?.experiments ?? [];

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Debounced commit for search (real-time filtering)
  useEffect(() => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      setCommittedQuery(searchQuery);
      if (searchQuery.trim().length > 1) {
        addRecentSearch(searchQuery.trim());
        setRecentSearches(getRecentSearches());
      }
    }, 200);
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = useMemo(
    () => getSuggestions(searchQuery, experiments, subjects),
    [searchQuery, experiments, subjects]
  );

  const { experiments: filteredExperiments, detectedSubject, keywords } = useMemo(
    () => smartSearch(experiments, committedQuery, selectedSubject, subjects),
    [experiments, committedQuery, selectedSubject, subjects]
  );

  const handleSelectSuggestion = useCallback((value: string) => {
    setSearchQuery(value);
    setCommittedQuery(value);
    setShowDropdown(false);
    addRecentSearch(value);
    setRecentSearches(getRecentSearches());
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCommittedQuery("");
    setShowDropdown(false);
    searchInputRef.current?.focus();
  }, []);

  const handleClearRecent = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearRecentSearches();
      setRecentSearches([]);
    },
    []
  );

  const handleSubjectClick = useCallback(
    (subject: string | null) => {
      setSelectedSubject((prev) => (subject === prev ? null : subject));
      setSearchQuery("");
      setCommittedQuery("");
    },
    []
  );

  const showSuggestions = showDropdown && searchQuery.trim().length > 0 && suggestions.length > 0;
  const showRecent = showDropdown && searchQuery.trim().length === 0 && recentSearches.length > 0;
  const showDropdownPanel = showSuggestions || showRecent;

  const headerTitle = (() => {
    if (selectedSubject) return `${selectedSubject} Experiments`;
    if (detectedSubject && committedQuery.trim()) return `${detectedSubject} — Smart Search`;
    if (committedQuery.trim()) return "Search Results";
    return "All Experiments";
  })();

  const headerSubtitle = (() => {
    if (keywords.length > 0) {
      return `Matching "${keywords.join(", ")}"${detectedSubject && !selectedSubject ? ` in ${detectedSubject}` : ""}`;
    }
    if (detectedSubject && !selectedSubject && committedQuery.trim()) {
      return `Showing experiments from ${detectedSubject}`;
    }
    return "Browse, search, and copy code snippets for your lab assignments.";
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold font-mono tracking-tight text-primary mb-4">ExpLib_</h1>

          {/* Smart Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search or filter by subject..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-md bg-background/50 border border-sidebar-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                    handleClearSearch();
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-sm transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown: Suggestions or Recent Searches */}
            {showDropdownPanel && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-popover-border rounded-lg shadow-xl overflow-hidden"
              >
                {showRecent && (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</span>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    {recentSearches.map((recent) => (
                      <button
                        key={recent}
                        onClick={() => handleSelectSuggestion(recent)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent/30 transition-colors text-left"
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{recent}</span>
                      </button>
                    ))}
                  </>
                )}
                {showSuggestions && (
                  <>
                    <div className="px-3 py-2 border-b border-border/30">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggestions</span>
                    </div>
                    {suggestions.map((suggestion) => {
                      const isSubject = subjects.includes(suggestion);
                      return (
                        <button
                          key={suggestion}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/30 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isSubject ? (
                              <span className="h-3.5 w-3.5 rounded-sm bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0">S</span>
                            ) : (
                              <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="truncate">{suggestion}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Smart search hint */}
          {!committedQuery.trim() && (
            <p className="text-[11px] text-muted-foreground/60 mt-2 leading-tight px-0.5">
              Try "os", "dbms normalization", or "tcp"
            </p>
          )}
          {detectedSubject && !selectedSubject && committedQuery.trim() && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></span>
              <span>Subject detected: <strong>{detectedSubject}</strong></span>
            </div>
          )}
        </div>

        {/* Subject list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">Subjects</h2>

            <button
              onClick={() => handleSubjectClick(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedSubject === null
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-border/50 hover:text-foreground"
              }`}
            >
              All Subjects
            </button>

            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectClick(subject)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedSubject === subject
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-border/50 hover:text-foreground"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{headerTitle}</h2>
            <p className="text-muted-foreground mt-2">{headerSubtitle}</p>
            {(committedQuery.trim() || selectedSubject) && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-sm text-muted-foreground">
                  {filteredExperiments.length} result{filteredExperiments.length !== 1 ? "s" : ""}
                </span>
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono"
                  >
                    {kw}
                  </span>
                ))}
                {(committedQuery.trim() || selectedSubject) && (
                  <button
                    onClick={() => {
                      handleClearSearch();
                      setSelectedSubject(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </header>

          {isLoading ? (
            <div className="flex flex-col space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col space-y-4 glass-card p-6 rounded-xl">
                  <div className="h-6 bg-muted/50 rounded w-1/4"></div>
                  <div className="h-4 bg-muted/50 rounded w-2/3"></div>
                  <div className="h-40 bg-background rounded-lg border border-border/50"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center border border-destructive/30 bg-destructive/10 rounded-xl text-destructive-foreground">
              Failed to load experiments. Please try again.
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-dashed border-border animate-in fade-in">
              <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No experiments found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {committedQuery.trim()
                  ? `No results for "${committedQuery}". Try a different keyword or subject.`
                  : "No experiments in this subject yet."}
              </p>
              {committedQuery.trim() && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-sm text-primary hover:underline transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-8">
              {filteredExperiments.map((experiment) => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  keywords={keywords}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
