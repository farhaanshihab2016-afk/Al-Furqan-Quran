import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadLastRead } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al-Furqan · Read & Listen to the Quran" },
      {
        name: "description",
        content:
          "Al-Furqan is a calm Quran reader with Arabic Uthmani script, tajweed colouring, word-by-word study, English translation and verse-by-verse recitation audio.",
      },
      { property: "og:title", content: "Al-Furqan · Read & Listen to the Quran" },
      {
        property: "og:description",
        content:
          "Read the Quran in Uthmani or tajweed script with word-by-word study, translation and recitation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumeRoute,
});

function ResumeRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const last = loadLastRead();
    void navigate({
      to: "/surah/$number",
      params: { number: String(last?.surah ?? 1) },
      search: { verse: last?.verse && last.verse > 1 ? last.verse : 1 },
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Opening your last reading…</p>
    </div>
  );
}
