import { Volume2 } from "lucide-react";

export function AudioControl({ src, label }: { src: string; label: string }) {
  return (
    <div className="audio-control">
      <Volume2 aria-hidden="true" size={18} />
      <audio controls preload="none" aria-label={label} src={src} />
    </div>
  );
}
