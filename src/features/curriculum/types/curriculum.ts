export interface LevelSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  writingCharacter: string | null;
  sortOrder: number;
}

export interface UnitSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface LevelDetail extends LevelSummary {
  units: UnitSummary[];
}

export interface UnitDetail extends UnitSummary {
  lessons: LessonSummary[];
}

export interface ExampleSentence {
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  audioUrl: string | null;
  sortOrder: number;
}

export interface Vocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  audioUrl: string | null;
  examples: ExampleSentence[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  explanationVi: string;
  examples: string[];
  sortOrder: number;
}

export interface LessonDetail extends LessonSummary {
  vocabulary: Vocabulary[];
  grammarPoints: GrammarPoint[];
}
