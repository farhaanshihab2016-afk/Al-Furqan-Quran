export interface Chapter {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  bismillah_pre: boolean;
  revelation_place: string;
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Word {
  id: number;
  position: number;
  text: string;
  tajweed_html: string;
  transliteration: string;
  translation: string;
  is_end_marker: boolean;
}

export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  tajweed_html: string;
  juz_number: number;
  page_number: number;
  hizb_number: number;
  sajdah: boolean;
  words: Word[];
  translation?: string;
}

export interface AudioFile {
  verse_key: string;
  url: string;
}
