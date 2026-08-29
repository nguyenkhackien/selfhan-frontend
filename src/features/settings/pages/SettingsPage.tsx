import { PageFrame } from "@/shared/components";
import { themes, useTheme } from "@/shared/theme";

export function SettingsPage() {
  const { setTheme, theme } = useTheme();

  return (
    <PageFrame title="Cài đặt giao diện" eyebrow="TÙY CHỈNH TRẢI NGHIỆM">
      <section className="settings-panel" aria-labelledby="theme-heading">
        <div>
          <h2 id="theme-heading">Chủ đề màu</h2>
          <p>
            Chọn bảng màu phù hợp với nhịp học của bạn. Lựa chọn này được lưu
            trên trình duyệt hiện tại.
          </p>
        </div>
        <div
          className="theme-options"
          role="radiogroup"
          aria-label="Chủ đề màu"
        >
          {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
            <label
              className="theme-option"
              data-selected={theme === key}
              data-theme-option={key}
              key={key}
            >
              <input
                checked={theme === key}
                name="theme"
                onChange={() => setTheme(key)}
                type="radio"
                value={key}
              />
              <span className="theme-swatch" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="theme-option-copy">
                <strong>{themes[key].name}</strong>
                <span>{themes[key].description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
