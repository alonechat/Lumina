import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { GlassButton } from "@/components/glass/GlassButton";
import { Sparkles, LogIn, UserPlus, ArrowRight, AlertCircle } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("local_auth_token", data.token);
        window.location.href = "/";
      } else {
        setError(data.error || "Login failed");
      }
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("local_auth_token", data.token);
        window.location.href = "/";
      } else {
        setError(data.error || "Registration failed");
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      if (username.length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      registerMutation.mutate({ username, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030305]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full opacity-20 blur-[150px]"
          style={{ background: "radial-gradient(circle, #6D28D9, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, #2DD4BF, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#2DD4BF] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#6D28D9]/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Lumina Glass
          </h1>
          <p className="text-sm text-[#8B8B96] mt-1">
            {mode === "login" ? "Sign in to your sanctuary" : "Create your account"}
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] mb-6 relative z-10">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-white/80"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-white/80"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs text-[#8B8B96] mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="glass-input w-full"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8B8B96] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min 6 characters" : "Enter password"}
                className="glass-input w-full"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm py-2 px-3 rounded-lg bg-red-500/10">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <GlassButton
              variant="primary"
              className="w-full mt-2"
              disabled={isPending}
            >
              {isPending ? (
                <span className="animate-pulse">Please wait...</span>
              ) : mode === "login" ? (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GlassButton>
          </form>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-[#8B8B96]/60 mt-6">
          Your data is stored locally in SQLite
        </p>
      </div>
    </div>
  );
}
