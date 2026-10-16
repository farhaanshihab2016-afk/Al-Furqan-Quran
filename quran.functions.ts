import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchChapterAudio, fetchChapters, fetchVerses } from "./quran.server";

export const getChapters = createServerFn({ method: "GET" }).handler(async () => {
  return fetchChapters();
});

export const getVerses = createServerFn({ method: "GET" })
  .validator(
    z.object({
      chapterNumber: z.number().int().min(1).max(114),
    }),
  )
  .handler(async ({ data }) => {
    return fetchVerses(data.chapterNumber);
  });

export const getChapterAudio = createServerFn({ method: "GET" })
  .validator(
    z.object({
      chapterNumber: z.number().int().min(1).max(114),
      reciterId: z.number().int().min(1).max(200),
    }),
  )
  .handler(async ({ data }) => {
    return fetchChapterAudio(data.chapterNumber, data.reciterId);
  });
