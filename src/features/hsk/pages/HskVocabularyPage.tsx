import { useCallback } from "react";
import { useParams } from "react-router";
import {
  BackLink,
  ErrorState,
  LoadingState,
  PageFrame,
} from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { hskApi } from "../api/hskApi";
import { WordWritingPractice } from "../components/WordWritingPractice";
import type { HskVocabularyDetail } from "../types/hsk";

export function HskVocabularyPage() {
  const { id = "" } = useParams();
  const load = useCallback(() => hskApi.getVocabulary(id), [id]);
  const resource = useRemoteResource<HskVocabularyDetail>(
    load,
    "hsk-word:" + id,
  );
  if (resource.loading)
    return (
      <PageFrame title="Đang mở từ HSK">
        <LoadingState />
      </PageFrame>
    );
  if (resource.error)
    return (
      <PageFrame title="Không mở được từ HSK">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </PageFrame>
    );
  const word = resource.data;
  if (!word) return null;
  return (
    <PageFrame
      title={word.simplified}
      eyebrow={"HSK " + (word.hskBand === 7 ? "7–9" : word.hskBand)}
    >
      <BackLink to="/hsk">Quay lại từ vựng HSK</BackLink>
      <section className="hsk-word-detail">
        <div>
          <span className="hanzi">{word.simplified}</span>
          {word.traditional && word.traditional !== word.simplified ? (
            <p>Phồn thể: {word.traditional}</p>
          ) : null}
        </div>
        <div>
          <p className="pinyin">{word.pinyin}</p>
          {word.sinoViet ? <p>Hán Việt: {word.sinoViet}</p> : null}
          <h2>Nghĩa tiếng Việt</h2>
          <ul>
            {word.senses.map((sense, index) => (
              <li key={index + sense}>{sense}</li>
            ))}
          </ul>
        </div>
      </section>
      {word.importStatus === "needs_review" ? (
        <p className="hsk-review-note">
          Một phần dữ liệu nguồn của từ này đang cần được rà soát.
        </p>
      ) : null}
      <WordWritingPractice word={word.simplified} />
    </PageFrame>
  );
}
