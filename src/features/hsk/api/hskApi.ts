import { request } from "@/shared/api/httpClient";
import type {
  HskBand,
  HskVocabularyDetail,
  HskVocabularyPage,
} from "../types/hsk";

export const hskApi = {
  listBands: () => request<{ items: HskBand[] }>("/hsk/bands"),
  listVocabulary: (input: {
    band?: number;
    query?: string;
    cursor?: string;
  }) => {
    const params = new URLSearchParams({ limit: "24" });
    if (input.band !== undefined) params.set("band", String(input.band));
    if (input.query) params.set("query", input.query);
    if (input.cursor) params.set("cursor", input.cursor);
    return request<HskVocabularyPage>("/hsk/vocabulary?" + params.toString());
  },
  getVocabulary: (id: string) =>
    request<HskVocabularyDetail>("/hsk/vocabulary/" + id),
};
