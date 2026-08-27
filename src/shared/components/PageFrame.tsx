import type { ReactNode } from "react";

export function PageFrame({
  title,
  eyebrow = "SELFHAN",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <header className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </header>
      {children}
    </div>
  );
}
