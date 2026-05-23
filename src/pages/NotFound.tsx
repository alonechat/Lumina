import { Link } from "react-router";
import { GlassButton } from "@/components/glass/GlassButton";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ background: "var(--base-dark)" }}
    >
      <h1 className="font-display text-8xl font-bold text-white mb-4">404</h1>
      <p className="text-[#8B8B96] mb-8">This page does not exist in this dimension</p>
      <Link to="/">
        <GlassButton>
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </GlassButton>
      </Link>
    </div>
  );
}
