import { request } from "@/shared/api/httpClient";
import type {
  HskBand,
  HskVocabularyDetail,
  HskVocabularyPage,
} from "../types/hsk";

export const hskApi = {
  listBands: () => request<{ items: HskBand[] }>("/hsk/bands"),
  listVocabulary: (input: { band?: number; query?: string; cursor?: string }) =>
    request<HskVocabularyPage>("/hsk/vocabulary", {
      params: {
        limit: 24,
        band: input.band,
        query: input.query || undefined,
        cursor: input.cursor || undefined,
      },
    }),
  getVocabulary: (id: string) =>
    request<HskVocabularyDetail>("/hsk/vocabulary/" + id),
};
