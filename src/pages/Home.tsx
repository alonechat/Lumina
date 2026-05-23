import { useEffect, useState, useRef, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import ParticleCanvas from "@/components/background/ParticleCanvas";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { Link } from "react-router";
import {
  BookOpen,
  PenLine,
  Sparkles,
  Calendar,
  ArrowRight,
  FileText,
  TrendingUp,
  ChevronUp,
  BarChart3,
} from "lucide-react";

export default function Home() {
  const [showHero, setShowHero] = useState(() => {
    return localStorage.getItem("lumina_hero_seen") !== "true";
  });
  const [entered, setEntered] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data: quote } = trpc.quotes.random.useQuery();
  const { data: notesList } = trpc.notes.list.useQuery({});
  const { data: diariesList } = trpc.diaries.list.useQuery({});

  const totalNotes = notesList?.length ?? 0;
  const totalDiaries = diariesList?.length ?? 0;

  const handleEnter = () => {
    setEntered(true);
    localStorage.setItem("lumina_hero_seen", "true");
    setTimeout(() => {
      setShowHero(false);
    }, 800);
  };

  // Typewriter effect for quote
  const [displayText, setDisplayText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const quoteRef = useRef({ index: 0, text: "" });

  const startTyping = useCallback(() => {
    if (!quote?.text) return;
    quoteRef.current = { index: 0, text: quote.text };
    setDisplayText("");
    setIsTypingDone(false);

    const typeNext = () => {
      const { index, text } = quoteRef.current;
      if (index < text.length) {
        quoteRef.current.index = index + 1;
        setDisplayText(text.slice(0, index + 1));
        setTimeout(typeNext, 40);
      } else {
        setIsTypingDone(true);
      }
    };

    setTimeout(typeNext, 500);
  }, [quote?.text]);

  useEffect(() => {
    if (quote?.text) {
      startTyping();
    }
  }, [quote?.text, startTyping]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative">
      {/* ─── Hero Section ─────────────────────────────── */}
      {showHero && (
        <section
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ${
            entered ? "opacity-0 scale-105 pointer-events-none" : "opacity-100"
          }`}
          style={{ background: "var(--base-dark)" }}
        >
          {/* Hero Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/hero-bg.jpg"
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030305]/50 to-[#030305]" />
          </div>

          {/* 3D Title */}
          <div className="relative z-10 text-center mb-12">
            <h1 className="text-3d text-[12vw] leading-none tracking-tighter select-none">
              LUMINA
            </h1>
            <p className="font-mono-display text-xs text-[#8B8B96] mt-4 tracking-[0.3em] uppercase">
              Digital Sanctuary for Thought
            </p>
          </div>

          {/* Initialize Button */}
          <div className="relative z-10">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleEnter}
              className="gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              Initialize
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </GlassButton>
          </div>

          {/* Floating particles decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/20 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Main Dashboard ───────────────────────────── */}
      <div ref={dashboardRef} className="relative h-full overflow-y-auto">
        {/* Particle Background */}
        <div className="fixed inset-0 z-0">
          <ParticleCanvas />
        </div>

        {/* Dashboard Content */}
        <div className="relative z-10 p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-page-in">
          {/* Daily Quote Panel */}
          <section className="flex justify-center pt-4">
            <div className="w-full glass-card animate-breathe">
              <div className="flex items-center justify-center gap-2 mb-5 relative z-10">
                <Sparkles className="w-4 h-4 text-[#6D28D9]" />
                <span className="font-mono-display text-xs text-[#8B8B96] uppercase tracking-[0.2em]">
                  Daily Wisdom
                </span>
                <Sparkles className="w-4 h-4 text-[#6D28D9]" />
              </div>
              <blockquote className="font-display text-xl lg:text-2xl text-white leading-relaxed mb-5 text-center relative z-10 min-h-[3em]">
                <span className="text-[#8B8B96]">&ldquo;</span>
                {displayText}
                <span className="text-[#8B8B96]">&rdquo;</span>
                {!isTypingDone && (
                  <span className="inline-block w-[2px] h-[1.2em] bg-[#2DD4BF] ml-1 animate-typewriter-cursor align-middle" />
                )}
              </blockquote>
              {quote?.author && (
                <cite className="text-[#8B8B96] text-sm not-italic text-center block relative z-10">
                  — {quote.author}
                </cite>
              )}
            </div>
          </section>

          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="text-center glass-card-hover" hover={false}>
              <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/15 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-0.5">
                {totalNotes}
              </h3>
              <p className="text-xs text-[#8B8B96]">Notes Created</p>
            </GlassCard>

            <GlassCard className="text-center glass-card-hover" hover={false}>
              <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 flex items-center justify-center mx-auto mb-3">
                <PenLine className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-0.5">
                {totalDiaries}
              </h3>
              <p className="text-xs text-[#8B8B96]">Journal Entries</p>
            </GlassCard>

            <GlassCard className="text-center glass-card-hover" hover={false}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9]/15 to-[#2DD4BF]/15 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-0.5">
                {totalNotes + totalDiaries}
              </h3>
              <p className="text-xs text-[#8B8B96]">Total Thoughts</p>
            </GlassCard>
          </section>

          {/* Quick Access Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/notes" className="group">
              <GlassCard className="h-full glass-card-hover" hover={false}>
                <div className="flex flex-col items-center text-center h-full justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#6D28D9]/15 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white mb-1">
                      Notes
                    </h3>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Your knowledge base with folders, tags, and linking
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A78BFA] text-xs">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </GlassCard>
            </Link>

            <Link to="/diary" className="group">
              <GlassCard className="h-full glass-card-hover" hover={false}>
                <div className="flex flex-col items-center text-center h-full justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/15 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#2DD4BF]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white mb-1">
                      Diary
                    </h3>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Daily reflections with mood and weather tracking
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2DD4BF] text-xs">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </GlassCard>
            </Link>

            <Link to="/graph" className="group">
              <GlassCard className="h-full glass-card-hover" hover={false}>
                <div className="flex flex-col items-center text-center h-full justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D28D9]/15 to-[#2DD4BF]/15 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white mb-1">
                      Graph
                    </h3>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Visualize connections between your notes
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A78BFA] text-xs">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          </section>

          {/* Footer */}
          <footer className="pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  to="/notes"
                  className="text-xs text-[#8B8B96] hover:text-white transition-colors"
                >
                  Notes
                </Link>
                <Link
                  to="/diary"
                  className="text-xs text-[#8B8B96] hover:text-white transition-colors"
                >
                  Diary
                </Link>
                <Link
                  to="/graph"
                  className="text-xs text-[#8B8B96] hover:text-white transition-colors"
                >
                  Graph
                </Link>
                <Link
                  to="/settings"
                  className="text-xs text-[#8B8B96] hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </div>
              <button
                onClick={scrollToTop}
                className="liquid-glass rounded-xl p-2.5 hover:bg-white/5 transition-colors"
                aria-label="Back to top"
              >
                <ChevronUp className="w-4 h-4 text-[#8B8B96]" />
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="font-mono-display text-[11px] text-[#8B8B96]/40">
                copyright 2026 AloneChat
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
