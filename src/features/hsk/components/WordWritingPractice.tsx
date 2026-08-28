import HanziWriter from "hanzi-writer";
import { useEffect, useRef, useState, type PointerEvent } from "react";

type WritingMode = "guidance" | "background" | "white-paper";

interface StrokeStatus {
  readonly character: string;
  readonly mode: WritingMode;
  readonly message: string;
}

function loadLocalCharacter(character: string) {
  return fetch("/hsk-strokes/" + encodeURIComponent(character) + ".json").then(
    async (response) => {
      if (!response.ok) throw new Error("Stroke data is unavailable.");
      return response.json();
    },
  );
}

export function WordWritingPractice({ word }: { word: string }) {
  const characters = Array.from(word);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<WritingMode>("guidance");
  const [strokeStatus, setStrokeStatus] = useState<StrokeStatus | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const character = characters[index] ?? "";
  const strokeStatusMessage =
    mode === "white-paper"
      ? "Giấy trắng sẵn sàng để tập viết tự do."
      : strokeStatus?.character === character && strokeStatus.mode === mode
        ? strokeStatus.message
        : "Đang tải dữ liệu nét.";

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !character) return;
    target.replaceChildren();
    if (mode === "white-paper") {
      writerRef.current = null;
      return;
    }
    let active = true;
    let writer: HanziWriter | null = null;
    writer = HanziWriter.create(target, character, {
      width: 300,
      height: 300,
      padding: 18,
      showCharacter: mode === "guidance",
      showOutline: mode === "background",
      strokeColor: "#42664f",
      outlineColor: "#b7cbb9",
      charDataLoader: loadLocalCharacter,
      onLoadCharDataSuccess: () => {
        if (!active) return;
        setStrokeStatus({
          character,
          mode,
          message: "Dữ liệu nét đã sẵn sàng.",
        });
        if (mode === "guidance") {
          queueMicrotask(() => {
            if (active) void writer?.animateCharacter();
          });
        }
      },
      onLoadCharDataError: () => {
        if (active) {
          setStrokeStatus({
            character,
            mode,
            message: "Chưa có dữ liệu nét cục bộ cho chữ này.",
          });
        }
      },
    });
    writerRef.current = writer;
    return () => {
      active = false;
      writerRef.current = null;
      target.replaceChildren();
    };
  }, [character, mode]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext("2d");
    const position = point(event);
    if (!context || !position) return;
    isDrawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const context = canvasRef.current?.getContext("2d");
    const position = point(event);
    if (!context || !position) return;
    context.strokeStyle = "#42664f";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 9;
    context.lineTo(position.x, position.y);
    context.stroke();
  };

  return (
    <section className="hsk-writing" aria-labelledby="hsk-writing-heading">
      <p className="eyebrow">LUYỆN VIẾT</p>
      <h2 id="hsk-writing-heading">Viết theo thứ tự của từ</h2>
      <div className="hsk-character-tabs" aria-label="Chọn chữ để luyện">
        {characters.map((item, itemIndex) => (
          <button
            className={itemIndex === index ? "is-active" : ""}
            key={itemIndex + item}
            type="button"
            onClick={() => {
              setIndex(itemIndex);
              clearCanvas();
            }}
            aria-pressed={itemIndex === index}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="hsk-mode-tabs" aria-label="Chế độ luyện viết">
        {(
          [
            ["guidance", "Hướng dẫn"],
            ["background", "Chữ nền"],
            ["white-paper", "White paper"],
          ] as const
        ).map(([value, label]) => (
          <button
            className={value === mode ? "is-active" : ""}
            key={value}
            type="button"
            aria-pressed={value === mode}
            onClick={() => {
              setMode(value);
              clearCanvas();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="hsk-practice-sheet">
        {mode !== "white-paper" && (
          <div ref={targetRef} className="hsk-stroke-guide" />
        )}
        {mode !== "guidance" && (
          <canvas
            aria-label={"Khung tập viết chữ " + character}
            aria-describedby={
              mode === "white-paper"
                ? "hsk-writing-sheet-description"
                : undefined
            }
            className="hsk-drawing-canvas"
            ref={canvasRef}
            width="600"
            height="600"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={() => {
              isDrawing.current = false;
            }}
            onPointerCancel={() => {
              isDrawing.current = false;
            }}
          />
        )}
      </div>
      {mode === "white-paper" ? (
        <p id="hsk-writing-sheet-description">
          Giấy trắng chia bốn ô để bạn tự tập viết chữ {character}.
        </p>
      ) : null}
      <p role="status" aria-live="polite">
        {strokeStatusMessage}
      </p>
      <div className="canvas-actions">
        <button
          className="button button--secondary"
          type="button"
          onClick={clearCanvas}
        >
          Xoá nét viết
        </button>
        {mode === "guidance" && (
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void writerRef.current?.animateCharacter()}
          >
            Xem lại thứ tự nét
          </button>
        )}
        <button
          className="button button--primary"
          type="button"
          disabled={index === 0}
          onClick={() => {
            setIndex((value) => value - 1);
            clearCanvas();
          }}
        >
          Chữ trước
        </button>
        <button
          className="button button--primary"
          type="button"
          disabled={index === characters.length - 1}
          onClick={() => {
            setIndex((value) => value + 1);
            clearCanvas();
          }}
        >
          Chữ tiếp
        </button>
      </div>
    </section>
  );
}
