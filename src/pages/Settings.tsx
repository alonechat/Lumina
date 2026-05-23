import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { LogOut, User, Shield, Palette, Keyboard } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#8B8B96] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name ?? "User"}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#2DD4BF] flex items-center justify-center">
              <span className="text-xl font-display font-bold text-white">
                {(user?.name ?? "U")[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              {user?.name ?? "User"}
            </h3>
            <p className="text-sm text-[#8B8B96]">{user?.email ?? ""}</p>
            <p className="text-xs text-[#8B8B96] mt-1">
              Role: <span className="text-[#2DD4BF]">{user?.role ?? "user"}</span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Appearance */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-[#6D28D9]" />
          <h3 className="font-display text-lg font-semibold text-white">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Dark Mode</p>
              <p className="text-xs text-[#8B8B96]">Always on for Lumina Glass</p>
            </div>
            <div className="w-12 h-6 rounded-full bg-[#6D28D9] relative">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Keyboard Shortcuts */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Keyboard className="w-5 h-5 text-[#2DD4BF]" />
          <h3 className="font-display text-lg font-semibold text-white">Keyboard Shortcuts</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: "⌘K", action: "Command Palette" },
            { key: "⌘N", action: "New Note" },
            { key: "⌘D", action: "Today Diary" },
            { key: "Esc", action: "Close / Back" },
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-[#8B8B96]">{shortcut.action}</span>
              <kbd className="font-mono-display text-xs bg-white/5 px-2 py-1 rounded text-white">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Privacy */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-[#A78BFA]" />
          <h3 className="font-display text-lg font-semibold text-white">Privacy</h3>
        </div>
        <p className="text-sm text-[#8B8B96]">
          Your diary entries and notes are stored securely. You can encrypt sensitive
          diary entries with a password for additional security.
        </p>
      </GlassCard>

      {/* Account Actions */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[#f87171]" />
          <h3 className="font-display text-lg font-semibold text-white">Account</h3>
        </div>
        <GlassButton variant="primary" onClick={() => logout()} className="w-full">
          <LogOut className="w-4 h-4" />
          Sign Out
        </GlassButton>
      </GlassCard>

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="font-mono-display text-xs text-[#8B8B96]/50">
          copyright 2026 AloneChat
        </p>
        <p className="text-xs text-[#8B8B96]/30 mt-1">Lumina Glass v1.0.0</p>
      </div>
    </div>
  );
}
