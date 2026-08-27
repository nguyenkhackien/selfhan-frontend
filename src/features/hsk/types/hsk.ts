export interface HskBand {
  band: number;
  displayBand: string;
  count: number;
}

export interface HskVocabularySummary {
  id: string;
  hskBand: number;
  sourceOrder: number;
  simplified: string;
  pinyin: string;
  sinoViet: string | null;
  primaryMeaning: string | null;
  importStatus: "ready" | "needs_review";
}

export interface HskVocabularyPage {
  items: HskVocabularySummary[];
  nextCursor: string | null;
}

export interface HskVocabularyDetail extends HskVocabularySummary {
  traditional: string | null;
  frequency: number | null;
  senses: string[];
}
