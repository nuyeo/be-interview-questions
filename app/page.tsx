"use client";

import { useState, useEffect, useCallback } from "react";
import {
  QUESTIONS,
  CATEGORIES,
  DIFF_LABELS,
  CAT_COLORS,
  type Question,
} from "@/data/questions";

// ─── Helpers ───
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Main Component ───
export default function Home() {
  const [view, setView] = useState<"home" | "browse" | "study">("home");
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Load persisted state
  useEffect(() => {
    const s = loadJSON("streak", 0);
    const ld = loadJSON<string | null>("lastStudyDate", null);
    const tc = loadJSON("todayCount", { date: getToday(), count: 0 });
    const bk = loadJSON<number[]>("bookmarks", []);
    const cp = loadJSON<number[]>("completed", []);

    setStreak(s);
    setLastStudyDate(ld);
    setTodayCount(tc.date === getToday() ? tc.count : 0);
    setBookmarks(new Set(bk));
    setCompleted(new Set(cp));

    // Check streak break
    if (ld && ld !== getToday()) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (ld !== yesterday.toISOString().split("T")[0]) {
        setStreak(0);
        saveJSON("streak", 0);
      }
    }
    setLoaded(true);
  }, []);

  const pickRandom = useCallback(
    (cat = "all", diff = "all", review = false) => {
      let pool = review
        ? QUESTIONS.filter((q) => bookmarks.has(q.id))
        : QUESTIONS;
      if (cat !== "all") pool = pool.filter((q) => q.category === cat);
      if (diff !== "all")
        pool = pool.filter((q) => q.difficulty === Number(diff));
      if (pool.length === 0) return null;
      const unseen = pool.filter((q) => !completed.has(q.id));
      const final = unseen.length > 0 ? unseen : pool;
      return final[Math.floor(Math.random() * final.length)];
    },
    [bookmarks, completed]
  );

  const startStudy = (q: Question, isReview = false) => {
    setCurrentQ(q);
    setAnswer("");
    setFeedback(null);
    setReviewMode(isReview);
    setView("study");
  };

  const markStudied = async () => {
    if (!currentQ) return;
    const today = getToday();
    const newCompleted = new Set(completed);
    newCompleted.add(currentQ.id);
    setCompleted(newCompleted);
    saveJSON("completed", [...newCompleted]);

    let newStreak = streak;
    if (lastStudyDate !== today) {
      newStreak = streak + 1;
      setStreak(newStreak);
      setLastStudyDate(today);
      saveJSON("streak", newStreak);
      saveJSON("lastStudyDate", today);
    }

    const newCount = (lastStudyDate === today ? todayCount : 0) + 1;
    setTodayCount(newCount);
    saveJSON("todayCount", { date: today, count: newCount });
  };

  const toggleBookmark = (qId: number) => {
    const newBk = new Set(bookmarks);
    if (newBk.has(qId)) newBk.delete(qId);
    else newBk.add(qId);
    setBookmarks(newBk);
    saveJSON("bookmarks", [...newBk]);
  };

  const requestFeedback = async () => {
    if (!answer.trim() || !currentQ) return;
    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.question,
          answer: answer,
        }),
      });
      const data = await res.json();
      setFeedback(data.feedback || data.error || "피드백을 받지 못했습니다.");
    } catch {
      setFeedback("네트워크 오류가 발생했습니다.");
    }
    setLoadingFeedback(false);
  };

  const totalQ = QUESTIONS.length;
  const completedCount = completed.size;
  const bookmarkCount = bookmarks.size;
  const progress = Math.round((completedCount / totalQ) * 100);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  // ━━━ HOME VIEW ━━━
  if (view === "home") {
    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              CS 면접 마스터
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              매일 한 문제, 백엔드 면접 준비
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-gradient-to-br from-orange-500/10 to-amber-500/8 border border-amber-500/20 rounded-2xl p-4 text-center">
              <div className="text-[28px] animate-fire">🔥</div>
              <div className="text-[32px] font-extrabold text-amber-400 leading-none">
                {streak}
              </div>
              <div className="text-xs text-zinc-400 mt-1">일 연속</div>
            </div>
            <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-zinc-200 mt-2">
                {todayCount}
              </div>
              <div className="text-xs text-zinc-500 mt-1">오늘 학습</div>
            </div>
            <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-zinc-200 mt-2">
                {completedCount}/{totalQ}
              </div>
              <div className="text-xs text-zinc-500 mt-1">완료</div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 font-semibold whitespace-nowrap">
              {progress}% 달성
            </span>
          </div>

          {/* Main CTA */}
          <button
            onClick={() => {
              const q = pickRandom();
              if (q) startStudy(q);
            }}
            className="w-full py-[18px] text-[17px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[14px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
          >
            ⚡ 오늘의 랜덤 문제 풀기
          </button>

          {/* Bookmark Review */}
          {bookmarkCount > 0 && (
            <button
              onClick={() => {
                const q = pickRandom("all", "all", true);
                if (q) startStudy(q, true);
              }}
              className="w-full mt-3 py-3.5 text-[15px] font-semibold text-amber-400 bg-amber-400/[0.08] border border-amber-400/25 rounded-xl hover:bg-amber-400/15 transition-all cursor-pointer"
            >
              🔖 북마크 복습하기 ({bookmarkCount}문제)
            </button>
          )}

          {/* Categories */}
          <div className="mt-8 mb-3.5 text-base font-bold text-zinc-400 tracking-tight">
            카테고리별 학습
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {CATEGORIES.map((cat) => {
              const catQs = QUESTIONS.filter((q) => q.category === cat);
              const catDone = catQs.filter((q) => completed.has(q.id)).length;
              const pct = Math.round((catDone / catQs.length) * 100);
              const color = CAT_COLORS[cat] || "#888";
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCat(cat);
                    setView("browse");
                  }}
                  className="flex flex-col items-start gap-1 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-all text-left cursor-pointer"
                  style={{ borderColor: color + "33" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[13px] font-semibold text-zinc-200">
                    {cat}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {catDone}/{catQs.length}
                  </span>
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setFilterCat("all");
              setView("browse");
            }}
            className="w-full py-3 text-sm font-semibold text-indigo-400 border border-indigo-400/20 rounded-[10px] hover:bg-indigo-400/[0.06] transition-all cursor-pointer"
          >
            전체 질문 보기 →
          </button>
        </div>
      </div>
    );
  }

  // ━━━ BROWSE VIEW ━━━
  if (view === "browse") {
    let filtered = QUESTIONS.slice();
    if (filterCat !== "all")
      filtered = filtered.filter((q) => q.category === filterCat);
    if (filterDiff !== "all")
      filtered = filtered.filter((q) => q.difficulty === Number(filterDiff));

    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <button
            onClick={() => setView("home")}
            className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none"
          >
            ← 홈으로
          </button>

          <h2 className="text-[22px] font-extrabold flex items-center gap-2.5 mb-4">
            {filterCat === "all" ? "전체 질문" : filterCat}
            <span className="text-sm font-medium text-zinc-500">
              {filtered.length}문제
            </span>
          </h2>

          {/* Filters */}
          <div className="flex gap-2.5 mb-5">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">전체 카테고리</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">전체 난이도</option>
              <option value="1">기초</option>
              <option value="2">중급</option>
              <option value="3">심화</option>
            </select>
          </div>

          {/* Question List */}
          <div className="flex flex-col gap-3">
            {filtered.map((q) => {
              const isDone = completed.has(q.id);
              const isBk = bookmarks.has(q.id);
              return (
                <div
                  key={q.id}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-4"
                  style={{ opacity: isDone ? 0.6 : 1 }}
                >
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <DiffBadge difficulty={q.difficulty} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: CAT_COLORS[q.category] }}
                    >
                      {q.category}
                    </span>
                    {isDone && (
                      <span className="text-xs text-emerald-400 font-semibold">
                        ✓ 완료
                      </span>
                    )}
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className="ml-auto text-lg bg-transparent border-none cursor-pointer leading-none"
                      style={{ color: isBk ? "#fbbf24" : "#555" }}
                    >
                      {isBk ? "★" : "☆"}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                    {q.question}
                  </p>
                  <button
                    onClick={() => startStudy(q)}
                    className="text-[13px] font-semibold text-indigo-400 bg-indigo-400/[0.08] border border-indigo-400/20 rounded-lg px-4 py-2 hover:bg-indigo-400/15 transition-all cursor-pointer"
                  >
                    학습하기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ━━━ STUDY VIEW ━━━
  if (view === "study" && currentQ) {
    const isBk = bookmarks.has(currentQ.id);

    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <button
            onClick={() => setView("home")}
            className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none"
          >
            ← 홈으로
          </button>

          {reviewMode && (
            <div className="bg-amber-400/10 text-amber-400 px-4 py-2.5 rounded-[10px] text-sm font-semibold mb-4 text-center">
              🔖 북마크 복습 모드
            </div>
          )}

          {/* Question Card */}
          <div className="bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.05] border border-indigo-500/20 rounded-[18px] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <DiffBadge difficulty={currentQ.difficulty} />
              <span
                className="text-xs font-semibold"
                style={{ color: CAT_COLORS[currentQ.category] }}
              >
                {currentQ.category}
              </span>
              <button
                onClick={() => toggleBookmark(currentQ.id)}
                className="ml-auto text-[22px] bg-transparent border-none cursor-pointer leading-none"
                style={{ color: isBk ? "#fbbf24" : "#666" }}
              >
                {isBk ? "★" : "☆"}
              </button>
            </div>
            <h3 className="text-[17px] font-semibold leading-[1.7] text-zinc-100">
              {currentQ.question}
            </h3>
          </div>

          {/* Answer */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-zinc-400 mb-2.5">
              나의 답변
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="면접처럼 답변을 작성해보세요..."
              rows={6}
              className="w-full px-4 py-4 text-[15px] leading-[1.7] text-zinc-200 bg-white/[0.04] border border-white/10 rounded-[14px] outline-none resize-y min-h-[140px]"
            />
            <div className="flex gap-2.5 mt-3">
              <button
                disabled={!answer.trim() || loadingFeedback}
                onClick={requestFeedback}
                className="flex-1 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                {loadingFeedback ? "⏳ AI 분석 중..." : "🤖 AI 피드백 받기"}
              </button>
              <button
                onClick={async () => {
                  await markStudied();
                  const q = reviewMode
                    ? pickRandom("all", "all", true)
                    : pickRandom();
                  if (q) startStudy(q, reviewMode);
                  else setView("home");
                }}
                className="px-5 py-3.5 text-sm font-semibold text-zinc-400 bg-white/[0.05] border border-white/10 rounded-xl whitespace-nowrap cursor-pointer hover:bg-white/[0.08] transition-all"
              >
                다음 문제 →
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="bg-emerald-400/[0.06] border border-emerald-400/20 rounded-2xl p-5 mb-5">
              <div className="text-[15px] font-bold text-emerald-400 mb-3">
                🤖 AI 피드백
              </div>
              <pre className="text-sm leading-[1.75] text-zinc-300 whitespace-pre-wrap font-[inherit] m-0">
                {feedback}
              </pre>
            </div>
          )}

          {/* Complete Button */}
          {!completed.has(currentQ.id) && (
            <button
              onClick={async () => {
                await markStudied();
                setView("home");
              }}
              className="w-full py-4 text-base font-bold text-emerald-400 bg-emerald-400/[0.08] border border-emerald-400/25 rounded-[14px] cursor-pointer hover:bg-emerald-400/15 transition-all"
            >
              ✓ 학습 완료
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Sub-component ───
function DiffBadge({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const colors = {
    1: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    2: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    3: "bg-rose-400/10 text-rose-400 border-rose-400/30",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${colors[difficulty]}`}
    >
      {DIFF_LABELS[difficulty]}
    </span>
  );
}
