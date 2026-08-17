import type { PageHeadingMetadata } from "../../config/navigation";

interface PageHeadingProps {
  heading: PageHeadingMetadata;
}

export function PageHeading({ heading }: PageHeadingProps) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{heading.eyebrow}</p>
      <h1>{heading.title}</h1>
      <p>{heading.copy}</p>
    </header>
  );
}
