import { useCallback, useState } from "react";
import { Link } from "react-router";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageFrame,
} from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { hskApi } from "../api/hskApi";
import type { HskVocabularyPage } from "../types/hsk";

export function HskPage() {
  const [band, setBand] = useState(1);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const bands = useRemoteResource(hskApi.listBands, "hsk-bands");
  const load = useCallback(
    () => hskApi.listVocabulary({ band, query: submittedQuery }),
    [band, submittedQuery],
  );
  const vocabulary = useRemoteResource<HskVocabularyPage>(
    load,
    "hsk-vocabulary:" + band + ":" + submittedQuery,
  );

  return (
    <PageFrame title="Từ vựng HSK 3.0" eyebrow="HSK">
      <p className="lead">
        Học theo cấp độ, nghĩa tiếng Việt và âm Hán Việt được nhập cục bộ.
      </p>
      {bands.loading ? <LoadingState label="Đang tải cấp độ HSK" /> : null}
      {bands.error ? (
        <ErrorState message={bands.error} onRetry={bands.reload} />
      ) : null}
      {bands.data ? (
        <div className="hsk-band-tabs" aria-label="Chọn cấp độ HSK">
          {bands.data.items.map((item) => (
            <button
              className={item.band === band ? "is-active" : ""}
              key={item.band}
              type="button"
              aria-pressed={item.band === band}
              onClick={() => setBand(item.band)}
            >
              {item.displayBand} <span>{item.count}</span>
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="hsk-search"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <label htmlFor="hsk-search">
          Tìm chữ Hán, Pinyin, Hán Việt hoặc nghĩa
        </label>
        <div>
          <input
            id="hsk-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ví dụ: 你好, nǐ hǎo, xin chào"
          />
          <button className="button button--primary" type="submit">
            Tìm
          </button>
        </div>
      </form>
      {vocabulary.loading ? <LoadingState label="Đang tải từ vựng" /> : null}
      {vocabulary.error ? (
        <ErrorState message={vocabulary.error} onRetry={vocabulary.reload} />
      ) : null}
      {vocabulary.data?.items.length === 0 ? (
        <EmptyState>Chưa tìm thấy từ phù hợp.</EmptyState>
      ) : null}
      {vocabulary.data?.items.length ? (
        <div className="hsk-vocabulary-grid">
          {vocabulary.data.items.map((item) => (
            <Link
              className="hsk-word-card"
              key={item.id}
              to={"/hsk/vocabulary/" + item.id}
            >
              <span className="hanzi">{item.simplified}</span>
              <span className="pinyin">{item.pinyin}</span>
              <strong>{item.primaryMeaning ?? "Đang cần rà soát nghĩa"}</strong>
              {item.sinoViet ? <span>Hán Việt: {item.sinoViet}</span> : null}
              {item.importStatus === "needs_review" ? (
                <small>Cần rà soát dữ liệu</small>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </PageFrame>
  );
}
