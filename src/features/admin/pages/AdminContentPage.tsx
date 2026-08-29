import { Archive, FilePlus2, Pencil, ShieldAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import type { AuthState } from "@/features/auth";
import { ErrorState, LoadingState, PageFrame } from "@/shared/components";
import { useRemoteResource } from "@/shared/hooks/useRemoteResource";
import { adminApi } from "../api/adminApi";
import {
  ADMIN_RESOURCES,
  type AdminResource,
  type ContentRecord,
} from "../types/admin";

const RESOURCE_LABELS: Record<AdminResource, string> = {
  levels: "Cấp độ",
  units: "Chủ đề",
  lessons: "Bài học",
  vocabulary: "Từ vựng",
  "grammar-points": "Ngữ pháp",
  quizzes: "Quiz",
  "quiz-questions": "Câu hỏi quiz",
  "quiz-options": "Đáp án quiz",
};

const MUTABLE_FIELDS: Record<AdminResource, string[]> = {
  levels: ["slug", "title", "description", "sortOrder", "status"],
  units: ["levelId", "slug", "title", "description", "sortOrder", "status"],
  lessons: [
    "unitId",
    "slug",
    "title",
    "summary",
    "writingCharacter",
    "sortOrder",
    "status",
  ],
  vocabulary: ["hanzi", "pinyin", "meaningVi", "audioUrl", "status"],
  "grammar-points": [
    "lessonId",
    "title",
    "explanationVi",
    "examplesJson",
    "sortOrder",
  ],
  quizzes: ["lessonId", "unitId", "title", "kind", "passingScore", "status"],
  "quiz-questions": ["quizId", "type", "prompt", "audioUrl", "sortOrder"],
  "quiz-options": ["questionId", "label", "isCorrect", "sortOrder"],
};

function toEditable(record: ContentRecord, resource: AdminResource) {
  return Object.fromEntries(
    MUTABLE_FIELDS[resource]
      .filter((field) => field in record)
      .map((field) => [field, record[field]]),
  );
}

function normalizeData(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("Dữ liệu phải là một JSON object hợp lệ.");
  }
  return parsed as Record<string, unknown>;
}

export function AdminContentPage({ auth }: { auth: AuthState }) {
  if (auth.user?.role !== "admin") {
    return (
      <PageFrame title="Khu vực quản trị" eyebrow="ADMIN">
        <section className="learner-empty-state admin-access-denied">
          <ShieldAlert aria-hidden="true" size={38} />
          <h2>Bạn không có quyền truy cập</h2>
          <p>
            Chỉ tài khoản quản trị mới được tạo, chỉnh sửa hoặc lưu trữ nội dung
            học.
          </p>
          <Link className="button button--secondary" to="/dashboard">
            Về không gian học
          </Link>
        </section>
      </PageFrame>
    );
  }
  return <AdminContentWorkspace />;
}

function AdminContentWorkspace() {
  const [resource, setResource] = useState<AdminResource>("levels");
  const load = useCallback(() => adminApi.list(resource), [resource]);
  const remote = useRemoteResource(load, `admin:${resource}`);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <PageFrame title="Quản trị nội dung" eyebrow="ADMIN CONTENT">
      <p className="lead">
        Tạo cấu trúc cấp độ → chủ đề → bài học, rồi bổ sung quiz bằng các ID
        hiển thị trong bảng.
      </p>
      <div
        className="admin-resource-tabs"
        role="group"
        aria-label="Loại nội dung"
      >
        {ADMIN_RESOURCES.map((item) => (
          <button
            className={resource === item ? "is-active" : ""}
            aria-pressed={resource === item}
            key={item}
            onClick={() => {
              setResource(item);
              setCreating(false);
              setEditing(null);
            }}
            type="button"
          >
            {RESOURCE_LABELS[item]}
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <h2>{RESOURCE_LABELS[resource]}</h2>
        <button
          className="button button--primary"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          type="button"
        >
          <FilePlus2 aria-hidden="true" size={17} /> Tạo mới
        </button>
      </div>
      {creating || editing ? (
        <ContentForm
          key={`${resource}:${editing?.id ?? "new"}`}
          initial={editing ? toEditable(editing, resource) : {}}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            remote.reload();
          }}
          recordId={editing?.id}
          resource={resource}
        />
      ) : null}
      {remote.loading ? <LoadingState /> : null}
      {remote.error ? (
        <ErrorState message={remote.error} onRetry={remote.reload} />
      ) : null}
      {remote.data ? (
        <ContentTable
          records={remote.data}
          resource={resource}
          onArchive={() => remote.reload()}
          onEdit={setEditing}
        />
      ) : null}
    </PageFrame>
  );
}

function ContentForm({
  initial,
  onCancel,
  onSaved,
  recordId,
  resource,
}: {
  initial: Record<string, unknown>;
  onCancel(): void;
  onSaved(): void;
  recordId?: string;
  resource: AdminResource;
}) {
  const [value, setValue] = useState(() => JSON.stringify(initial, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const allowed = useMemo(
    () => MUTABLE_FIELDS[resource].join(", "),
    [resource],
  );
  const save = async () => {
    setError(null);
    let data: Record<string, unknown>;
    try {
      data = normalizeData(value);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "JSON không hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      if (recordId) await adminApi.update(resource, recordId, data);
      else await adminApi.create(resource, data);
      onSaved();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Chưa thể lưu nội dung.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="admin-form" aria-labelledby="admin-form-heading">
      <h2 id="admin-form-heading">
        {recordId ? "Chỉnh sửa bản ghi" : "Tạo bản ghi mới"}
      </h2>
      <p>
        Trường cho phép: <code>{allowed}</code>
      </p>
      <label htmlFor="admin-json">Dữ liệu JSON</label>
      <textarea
        id="admin-json"
        onChange={(event) => setValue(event.target.value)}
        rows={12}
        value={value}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-form-actions">
        <button
          className="button button--secondary"
          onClick={onCancel}
          type="button"
        >
          Hủy
        </button>
        <button
          className="button button--primary"
          disabled={saving}
          onClick={() => void save()}
          type="button"
        >
          {saving ? "Đang lưu…" : "Lưu nội dung"}
        </button>
      </div>
    </section>
  );
}

function ContentTable({
  onArchive,
  onEdit,
  records,
  resource,
}: {
  onArchive(): void;
  onEdit(record: ContentRecord): void;
  records: ContentRecord[];
  resource: AdminResource;
}) {
  const [error, setError] = useState<string | null>(null);
  const archive = async (record: ContentRecord) => {
    if (
      !window.confirm(
        "Lưu trữ bản ghi này? Nội dung sẽ không còn xuất hiện cho người học.",
      )
    )
      return;
    setError(null);
    try {
      await adminApi.archive(resource, record.id);
      onArchive();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể lưu trữ nội dung.",
      );
    }
  };
  if (!records.length)
    return (
      <section className="learner-empty-state">
        <h2>Chưa có bản ghi</h2>
        <p>Tạo bản ghi đầu tiên cho loại nội dung này.</p>
      </section>
    );
  return (
    <section
      className="admin-records"
      aria-label={`Danh sách ${RESOURCE_LABELS[resource]}`}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {records.map((record) => (
        <article className="admin-record" key={record.id}>
          <div>
            <strong>
              {String(
                record.title ??
                  record.hanzi ??
                  record.prompt ??
                  record.label ??
                  record.slug ??
                  "Bản ghi",
              )}
            </strong>
            <code>{record.id}</code>
          </div>
          <div className="admin-record-actions">
            <button
              className="button button--secondary"
              onClick={() => onEdit(record)}
              type="button"
            >
              <Pencil aria-hidden="true" size={16} /> Sửa
            </button>
            {"status" in record && record.status !== "archived" && (
              <button
                className="button button--secondary"
                onClick={() => void archive(record)}
                type="button"
              >
                <Archive aria-hidden="true" size={16} /> Lưu trữ
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
