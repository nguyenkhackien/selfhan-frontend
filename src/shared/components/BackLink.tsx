import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft aria-hidden="true" size={17} /> {children}
    </Link>
  );
}
