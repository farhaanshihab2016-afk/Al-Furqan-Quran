import type { AudioFile, Chapter, Verse } from "./quran.types";

const API_BASE = "https://api.quran.com/api/v4";
const AUDIO_BASE = "https://verses.quran.com/";
const TRANSLATION_ID = 20; // Saheeh International

export async function fetchChapters(): Promise<Chapter[]> {
  const response = await fetch(`${API_BASE}/chapters?language=en`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.status}`);
  }

  const data = (await response.json()) as { chapters: Chapter[] };
  return data.chapters;
}

interface ApiWord {
  id: number;
  position: number;
  char_type_name: string;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  translation?: { text: string };
  transliteration?: { text: string };
}

interface ApiVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  juz_number: number;
  page_number: number;
  hizb_number: number;
  sajdah_number: number | null;
  words?: ApiWord[];
  translations?: Array<{ text: string }>;
}

export async function fetchVerses(chapterNumber: number): Promise<Verse[]> {
  const params = new URLSearchParams({
    language: "en",
    words: "true",
    per_page: "300",
    translations: String(TRANSLATION_ID),
    fields:
      "text_uthmani,text_uthmani_tajweed,juz_number,page_number,hizb_number,sajdah_number,verse_number",
    word_fields: "text_uthmani,text_uthmani_tajweed",
  });

  const response = await fetch(`${API_BASE}/verses/by_chapter/${chapterNumber}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch verses: ${response.status}`);
  }

  const data = (await response.json()) as { verses: ApiVerse[] };

  return data.verses.map((verse) => ({
    id: verse.id,
    verse_key: verse.verse_key,
    verse_number: verse.verse_number,
    text_uthmani: verse.text_uthmani,
    tajweed_html: toTajweedHtml(verse.text_uthmani_tajweed ?? verse.text_uthmani),
    juz_number: verse.juz_number,
    page_number: verse.page_number,
    hizb_number: verse.hizb_number,
    sajdah: verse.sajdah_number !== null,
    words: (verse.words ?? [])
      .filter((word) => word.char_type_name === "word")
      .map((word) => ({
        id: word.id,
        position: word.position,
        text: word.text_uthmani,
        tajweed_html: toTajweedHtml(word.text_uthmani_tajweed ?? word.text_uthmani),
        transliteration: word.transliteration?.text ?? "",
        translation: word.translation?.text ?? "",
        is_end_marker: false,
      })),
    translation: stripFootnotes(verse.translations?.[0]?.text ?? ""),
  }));
}

/** Convert Quran.com tajweed markup into safe span markup with `tj-*` classes. */
function toTajweedHtml(markup: string): string {
  return markup
    .replace(/<span class=end>.*?<\/span>/gi, "")
    .replace(
      /<(?:tajweed|rule) class=([a-z_]+)>/gi,
      (_m, rule: string) => `<span class="tj-${rule}">`,
    )
    .replace(/<\/(?:tajweed|rule)>/gi, "</span>")
    .replace(/<(?!\/?span\b)[^>]*>/g, "")
    .trim();
}

export async function fetchChapterAudio(
  chapterNumber: number,
  reciterId: number,
): Promise<AudioFile[]> {
  const response = await fetch(
    `${API_BASE}/recitations/${reciterId}/by_chapter/${chapterNumber}?per_page=300`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch recitation audio: ${response.status}`);
  }

  const data = (await response.json()) as {
    audio_files: Array<{ verse_key: string; url: string }>;
  };

  return data.audio_files.map((file) => ({
    verse_key: file.verse_key,
    url: file.url.startsWith("http") ? file.url : `${AUDIO_BASE}${file.url}`,
  }));
}

function stripFootnotes(html: string): string {
  // Remove <sup foot_note=...>...</sup> markers from translation text.
  return html.replace(/<sup[^>]*>.*?<\/sup>/gi, "");
}
