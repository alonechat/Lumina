import { Link, useLocation, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  PenLine,
  Settings,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Search,
  X,
  FileText,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { GlassInput } from "./glass/GlassInput";
import { useNavigate } from "react-router";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/notes", icon: BookOpen, label: "Notes" },
  { path: "/diary", icon: PenLine, label: "Diary" },
  { path: "/graph", icon: Sparkles, label: "Graph" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const userDisplayName = user?.name || user?.username || "User";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030305]">
      {/* ─── Sidebar ────────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 z-50 relative",
          "border-r border-white/[0.06]",
          "liquid-glass-sidebar",
          isSidebarOpen ? "w-[240px]" : "w-[68px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#2DD4BF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#6D28D9]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-display text-lg font-semibold text-white tracking-tight">
              Lumina
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/" || location.pathname === "/dashboard"
                : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "liquid-glass-nav-active text-white"
                    : "text-[#8B8B96] hover:text-white/90"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6D28D9]/10 to-[#2DD4BF]/5 opacity-100" />
                )}
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0 relative z-10",
                    isActive ? "text-[#A78BFA]" : "group-hover:text-white/70"
                  )}
                />
                {isSidebarOpen && (
                  <span className="text-[13px] font-medium relative z-10 tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Command Palette Trigger */}
        <div className="px-2.5 pb-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
              "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]",
              "transition-all duration-200",
              !isSidebarOpen && "justify-center"
            )}
            title="Command Palette"
            aria-label="Open Command Palette"
          >
            <Search className="w-[18px] h-[18px] flex-shrink-0" />
            {isSidebarOpen && (
              <>
                <span className="text-[13px] font-medium">Search</span>
                <kbd className="ml-auto text-[10px] font-mono-display bg-white/[0.06] px-1.5 py-0.5 rounded text-[#8B8B96]">
                  Ctrl+K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* User Section */}
        <div className="px-2.5 pb-3 pt-2 border-t border-white/[0.06]">
          <div
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-xl transition-all",
              "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]",
              !isSidebarOpen && "justify-center p-2"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9]/60 to-[#2DD4BF]/60 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
              <span className="text-xs font-medium text-white">
                {userDisplayName[0]?.toUpperCase() || "U"}
              </span>
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white truncate font-medium">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-[#8B8B96] truncate">
                    {user?.email || "Local Account"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#6D28D9] flex items-center justify-center text-white hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#6D28D9]/30 z-50"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-3 h-3" />
          ) : (
            <PanelLeftOpen className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* ─── Main Content ───────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      {/* ─── Command Palette ────────────────────────────── */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}

// ─── Command Palette ──────────────────────────────────
function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const commands = [
    { label: "Go to Dashboard", shortcut: "g d", icon: LayoutDashboard, action: () => navigate("/") },
    { label: "Go to Notes", shortcut: "g n", icon: FileText, action: () => navigate("/notes") },
    { label: "Go to Diary", shortcut: "g j", icon: Calendar, action: () => navigate("/diary") },
    { label: "New Note", shortcut: "ctrl+n", icon: FileText, action: () => navigate("/notes?new=true") },
    { label: "Today Diary", shortcut: "ctrl+d", icon: PenLine, action: () => navigate("/diary") },
  ];

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.shortcut.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="liquid-glass rounded-2xl w-[560px] max-w-[90vw] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search className="w-5 h-5 text-[#8B8B96]" />
          <GlassInput
            className="flex-1 border-0 bg-transparent shadow-none focus:shadow-none"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filtered.map((cmd, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
              onClick={() => handleAction(cmd.action)}
            >
              <cmd.icon className="w-4 h-4 text-[#8B8B96]" />
              <span className="text-sm text-white">{cmd.label}</span>
              <kbd className="ml-auto text-[10px] font-mono-display bg-white/5 px-1.5 py-0.5 rounded text-[#8B8B96]">
                {cmd.shortcut}
              </kbd>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-[#8B8B96] text-sm">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
