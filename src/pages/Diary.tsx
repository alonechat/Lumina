import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  PenLine,
  Save,
  Lock,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Smile,
  Frown,
  Angry,
  Zap,
  Meh,
  CalendarDays,
  BookOpen,
} from "lucide-react";

const moodOptions = [
  { key: "happy", icon: Smile, label: "Happy", color: "#fbbf24" },
  { key: "calm", icon: Meh, label: "Calm", color: "#2DD4BF" },
  { key: "sad", icon: Frown, label: "Sad", color: "#60a5fa" },
  { key: "angry", icon: Angry, label: "Angry", color: "#f87171" },
  { key: "excited", icon: Zap, label: "Excited", color: "#e879f9" },
];

const weatherOptions = [
  { key: "sunny", icon: Sun, label: "Sunny" },
  { key: "cloudy", icon: Cloud, label: "Cloudy" },
  { key: "rainy", icon: CloudRain, label: "Rainy" },
  { key: "snowy", icon: Snowflake, label: "Snowy" },
];

export default function Diary() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editorContent, setEditorContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [selectedWeather, setSelectedWeather] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");

  const utils = trpc.useUtils();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: diaries } = trpc.diaries.list.useQuery({ year, month: month + 1 });
  const { data: selectedDiary } = trpc.diaries.getByDate.useQuery(
    { date: selectedDate.toISOString().split("T")[0] },
    { enabled: !!selectedDate }
  );

  const createDiary = trpc.diaries.create.useMutation({
    onSuccess: () => {
      utils.diaries.list.invalidate();
      utils.diaries.getByDate.invalidate({ date: selectedDate.toISOString().split("T")[0] });
    },
  });

  const updateDiary = trpc.diaries.update.useMutation({
    onSuccess: () => {
      utils.diaries.list.invalidate();
      utils.diaries.getByDate.invalidate({ date: selectedDate.toISOString().split("T")[0] });
    },
  });

  useEffect(() => {
    if (selectedDiary) {
      setEditorContent(selectedDiary.content ?? "");
      setSelectedMood(selectedDiary.mood ?? undefined);
      setSelectedWeather(selectedDiary.weather ?? undefined);
    } else {
      setEditorContent("");
      setSelectedMood(undefined);
      setSelectedWeather(undefined);
    }
  }, [selectedDiary]);

  const handleSave = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    if (selectedDiary) {
      updateDiary.mutate({
        id: selectedDiary.id,
        content: editorContent,
        mood: selectedMood,
        weather: selectedWeather,
      });
    } else {
      createDiary.mutate({
        date: dateStr,
        content: editorContent,
        mood: selectedMood,
        weather: selectedWeather,
      });
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasDiary = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return diaries?.some((d) => {
      const dDate = new Date(d.date);
      return dDate.toISOString().split("T")[0] === dateStr;
    });
  };

  const getDiaryMood = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return diaries?.find((d) => {
      const dDate = new Date(d.date);
      return dDate.toISOString().split("T")[0] === dateStr;
    })?.mood;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <div className="flex h-full gap-6 p-6">
      {/* ─── Left Panel: Calendar / Timeline ──────────── */}
      <div className="w-[420px] flex flex-col gap-4">
        {/* View Toggle */}
        <div className="liquid-glass rounded-xl p-1 flex gap-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors",
              viewMode === "calendar"
                ? "bg-white/10 text-white"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors",
              viewMode === "timeline"
                ? "bg-white/10 text-white"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Timeline
          </button>
        </div>

        {viewMode === "calendar" ? (
          <GlassCard className="flex-1" hover={false}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display text-lg font-semibold text-white">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs text-[#8B8B96] font-mono-display py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const diaryExists = hasDiary(day);
                const mood = getDiaryMood(day);
                const today = isToday(day);
                const sel = isSelected(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all",
                      sel
                        ? "bg-[#6D28D9]/30 ring-1 ring-[#6D28D9]"
                        : today
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm",
                        today ? "text-[#2DD4BF] font-semibold" : "text-white"
                      )}
                    >
                      {day}
                    </span>
                    {diaryExists && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            moodOptions.find((m) => m.key === mood)?.color ?? "#6D28D9",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mood Legend */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 flex-wrap">
                {moodOptions.map((m) => (
                  <div key={m.key} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-[10px] text-[#8B8B96]">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="flex-1 overflow-y-auto" hover={false}>
            <h3 className="font-display text-lg font-semibold text-white mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              {(diaries ?? []).length === 0 ? (
                <p className="text-sm text-[#8B8B96] text-center py-8">
                  No entries this month
                </p>
              ) : (
                diaries?.map((diary) => (
                  <button
                    key={diary.id}
                    onClick={() => {
                      const d = new Date(diary.date);
                      setSelectedDate(d);
                      setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-colors",
                      selectedDate.toDateString() === new Date(diary.date).toDateString()
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-[#8B8B96] font-mono-display">
                          {new Date(diary.date).toLocaleDateString("en", { weekday: "short" })}
                        </p>
                        <p className="text-lg font-display font-semibold text-white">
                          {new Date(diary.date).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#8B8B96] truncate">
                          {diary.content?.slice(0, 60) || "No content"}
                        </p>
                      </div>
                      {diary.mood && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              moodOptions.find((m) => m.key === diary.mood)?.color,
                          }}
                        />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* ─── Right Panel: Editor ──────────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Date Header */}
        <div className="liquid-glass rounded-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono-display text-xs text-[#8B8B96] uppercase tracking-wider">
                {selectedDate.toLocaleDateString("en", { weekday: "long" })}
              </p>
              <h2 className="font-display text-3xl font-bold text-white mt-1">
                {selectedDate.getDate()}
              </h2>
              <p className="text-sm text-[#8B8B96]">
                {selectedDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
              </p>
            </div>
            <GlassButton onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Entry
            </GlassButton>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="liquid-glass rounded-xl px-6 py-4">
          <p className="text-xs text-[#8B8B96] uppercase tracking-wider mb-3">Mood</p>
          <div className="flex gap-3">
            {moodOptions.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMood(selectedMood === m.key ? undefined : m.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                    selectedMood === m.key
                      ? "bg-white/10 ring-1"
                      : "hover:bg-white/5"
                  )}
                  style={
                    selectedMood === m.key
                      ? { borderColor: m.color + "60" } as React.CSSProperties
                      : undefined
                  }
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: selectedMood === m.key ? m.color : "#8B8B96",
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{
                      color: selectedMood === m.key ? m.color : "#8B8B96",
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weather Selector */}
        <div className="liquid-glass rounded-xl px-6 py-4">
          <p className="text-xs text-[#8B8B96] uppercase tracking-wider mb-3">Weather</p>
          <div className="flex gap-3">
            {weatherOptions.map((w) => {
              const Icon = w.icon;
              return (
                <button
                  key={w.key}
                  onClick={() =>
                    setSelectedWeather(selectedWeather === w.key ? undefined : w.key)
                  }
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                    selectedWeather === w.key
                      ? "bg-white/10 ring-1 ring-[#2DD4BF]/40"
                      : "hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      selectedWeather === w.key ? "text-[#2DD4BF]" : "text-[#8B8B96]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px]",
                      selectedWeather === w.key ? "text-[#2DD4BF]" : "text-[#8B8B96]"
                    )}
                  >
                    {w.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="liquid-glass rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
            <PenLine className="w-4 h-4 text-[#6D28D9]" />
            <span className="text-sm text-white">Journal Entry</span>
            {selectedDiary?.isLocked && (
              <Lock className="w-3 h-3 text-[#8B8B96] ml-auto" />
            )}
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Dear diary..."
            className="flex-1 bg-transparent text-white placeholder:text-[#8B8B96]/30 outline-none resize-none p-6 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
