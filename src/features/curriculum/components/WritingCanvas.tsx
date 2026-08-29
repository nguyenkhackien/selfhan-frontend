import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { getThemeColor, useTheme } from "@/shared/theme";

export function WritingCanvas({ character }: { character: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [typedEntry, setTypedEntry] = useState({ character, value: "" });
  const typedCharacter =
    typedEntry.character === character ? typedEntry.value : "";
  const keyboardInputId = useId();
  const keyboardDescriptionId = useId();
  const keyboardStatusId = useId();
  const { theme } = useTheme();
  const drawTemplate = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.dataset.theme = theme;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = getThemeColor("--color-canvas-guide");
    context.lineWidth = 2;
    context.setLineDash([8, 8]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 20);
    context.lineTo(canvas.width / 2, canvas.height - 20);
    context.moveTo(20, canvas.height / 2);
    context.lineTo(canvas.width - 20, canvas.height / 2);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = getThemeColor("--color-canvas-character");
    context.font = "260px 'Noto Serif SC', serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(character, canvas.width / 2, canvas.height / 2 + 8);
  }, [character, theme]);
  useEffect(() => {
    drawTemplate();
  }, [drawTemplate]);
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const box = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) * (canvas.width / box.width),
      y: (event.clientY - box.top) * (canvas.height / box.height),
    };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const position = point(event);
    context.beginPath();
    context.moveTo(position.x, position.y);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const position = point(event);
    context.strokeStyle = getThemeColor("--color-primary-hover");
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 9;
    context.lineTo(position.x, position.y);
    context.stroke();
    setHasStroke(true);
  };
  const stop = () => {
    drawingRef.current = false;
  };
  return (
    <section className="writing-practice" aria-labelledby="writing-heading">
      <div>
        <p className="eyebrow">LUYỆN VIẾT TAY</p>
        <h2 id="writing-heading">Viết chữ {character}</h2>
        <p>
          Dùng chuột hoặc ngón tay để tập nét. SelfHan không nhận diện, chấm
          điểm hoặc lưu nét viết này.
        </p>
      </div>
      <canvas
        className="writing-canvas"
        ref={canvasRef}
        width="720"
        height="420"
        aria-label={`Khung tập viết chữ ${character}`}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      <div className="writing-keyboard-alternative">
        <label htmlFor={keyboardInputId}>
          Nhập chữ {character} bằng bàn phím
        </label>
        <input
          autoComplete="off"
          id={keyboardInputId}
          inputMode="text"
          maxLength={1}
          onChange={(event) => {
            setTypedEntry({
              character,
              value: Array.from(event.target.value).at(-1) ?? "",
            });
          }}
          type="text"
          value={typedCharacter}
          aria-describedby={`${keyboardDescriptionId} ${keyboardStatusId}`}
        />
        <p id={keyboardDescriptionId}>
          Không có bộ gõ? Bạn vẫn có thể dùng bàn phím để nhập chữ mục tiêu; nội
          dung này chỉ kiểm tra tại chỗ và không được lưu.
        </p>
        <p id={keyboardStatusId} role="status" aria-live="polite">
          {typedCharacter
            ? typedCharacter === character
              ? "Chữ nhập trùng với mục tiêu."
              : `Hãy thử nhập chữ ${character}.`
            : "Có thể dùng bàn phím thay cho thao tác vẽ."}
        </p>
      </div>
      <div className="canvas-actions">
        <span aria-live="polite">
          {hasStroke ? "Bạn đang luyện viết" : "Sẵn sàng để bắt đầu"}
        </span>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            drawTemplate();
            setHasStroke(false);
          }}
        >
          Xoá nét viết
        </button>
      </div>
    </section>
  );
}
