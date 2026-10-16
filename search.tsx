import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { getChapters } from "@/lib/quran.functions";

const chaptersQueryOptions = () =>
  queryOptions({
    queryKey: ["quran", "chapters"],
    queryFn: () => getChapters(),
  });

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Surahs · Al-Furqan" },
      {
        name: "description",
        content:
          "Search all 114 surahs of the Quran by name, Arabic name, meaning or number and jump straight into reading.",
      },
      { property: "og:title", content: "Search Surahs · Al-Furqan" },
      {
        property: "og:description",
        content: "Find any surah by name, meaning or number in the Al-Furqan Quran reader.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(chaptersQueryOptions()),
  component: SearchPage,
});

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff ]/g, "");
}

function SearchPage() {
  const { data: chapters } = useSuspenseQuery(chaptersQueryOptions());
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return chapters;
    return chapters.filter((chapter) => {
      const haystack = [
        chapter.name_simple,
        chapter.name_complex,
        chapter.name_arabic,
        chapter.translated_name.name,
        String(chapter.id),
      ]
        .map(normalize)
        .join(" ");
      return haystack.includes(term);
    });
  }, [chapters, query]);

  return (
    <div className="min-h-screen bg-background px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/surah/$number"
          params={{ number: "1" }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reader
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-foreground">Search surahs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search by name, Arabic name, English meaning or surah number.
        </p>

        <div className="relative mt-6">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Yasin, The Opening, 36"
            aria-label="Search surahs"
            className="w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {results.length} {results.length === 1 ? "surah" : "surahs"}
        </p>

        <ul className="mt-3 space-y-2">
          {results.map((chapter) => (
            <li key={chapter.id}>
              <Link
                to="/surah/$number"
                params={{ number: String(chapter.id) }}
                className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-secondary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {chapter.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-card-foreground">
                    {chapter.name_simple}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {chapter.translated_name.name} · {chapter.verses_count} verses ·{" "}
                    {chapter.revelation_place}
                  </span>
                </span>
                <span
                  className="shrink-0 text-lg text-card-foreground"
                  style={{ fontFamily: "var(--font-arabic)" }}
                >
                  {chapter.name_arabic}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {results.length === 0 && (
          <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No surah matches “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
