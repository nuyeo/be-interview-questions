"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  QUESTIONS,
  CATEGORIES,
  DIFF_LABELS,
  CAT_COLORS,
  type Question,
} from "@/data/questions";

// ─── Types ───
type BrowseMode =
  | { type: "all" }
  | { type: "category"; category: string }
  | { type: "today" }
  | { type: "completed" }
  | { type: "bookmarks" };

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
  const [browseMode, setBrowseMode] = useState<BrowseMode>({ type: "all" });
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [todayIds, setTodayIds] = useState<Set<number>>(new Set());
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

  // Auth state
  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Auth ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? undefined,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0],
          avatar: session.user.user_metadata?.avatar_url,
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? undefined,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0],
          avatar: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ─── Load persisted state ───
  useEffect(() => {
    const s = loadJSON("streak", 0);
    const ld = loadJSON<string | null>("lastStudyDate", null);
    const tc = loadJSON("todayCount", { date: getToday(), count: 0 });
    const ti = loadJSON<number[]>("todayIds", []);
    const tiDate = loadJSON<string>("todayIdsDate", "");
    const bk = loadJSON<number[]>("bookmarks", []);
    const cp = loadJSON<number[]>("completed", []);

    setStreak(s);
    setLastStudyDate(ld);
    setTodayCount(tc.date === getToday() ? tc.count : 0);
    setTodayIds(tiDate === getToday() ? new Set(ti) : new Set());
    setBookmarks(new Set(bk));
    setCompleted(new Set(cp));

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
      let pool = review ? QUESTIONS.filter((q) => bookmarks.has(q.id)) : QUESTIONS;
      if (cat !== "all") pool = pool.filter((q) => q.category === cat);
      if (diff !== "all") pool = pool.filter((q) => q.difficulty === Number(diff));
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

    const newTodayIds = new Set(todayIds);
    newTodayIds.add(currentQ.id);
    setTodayIds(newTodayIds);
    saveJSON("todayIds", [...newTodayIds]);
    saveJSON("todayIdsDate", today);

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
        body: JSON.stringify({ question: currentQ.question, answer }),
      });
      const data = await res.json();
      setFeedback(data.feedback || data.error || "피드백을 받지 못했습니다.");
    } catch {
      setFeedback("네트워크 오류가 발생했습니다.");
    }
    setLoadingFeedback(false);
  };

  const openBrowse = (mode: BrowseMode) => {
    setBrowseMode(mode);
    setFilterCat("all");
    setFilterDiff("all");
    setView("browse");
  };

  const totalQ = QUESTIONS.length;
  const completedCount = completed.size;
  const bookmarkCount = bookmarks.size;
  const progress = Math.round((completedCount / totalQ) * 100);

  if (!loaded || authLoading) {
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
          {/* Header + Auth */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                CS 면접 마스터
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">매일 한 문제, 백엔드 면접 준비</p>
            </div>
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.avatar && (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                )}
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-300 max-w-[120px] truncate">{user.name}</div>
                  <button
                    onClick={signOut}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-200 bg-white/[0.06] border border-white/10 rounded-lg hover:bg-white/[0.1] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub 로그인
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-gradient-to-br from-orange-500/10 to-amber-500/8 border border-amber-500/20 rounded-2xl p-4 text-center">
              <div className="text-[28px] animate-fire">🔥</div>
              <div className="text-[32px] font-extrabold text-amber-400 leading-none">{streak}</div>
              <div className="text-xs text-zinc-400 mt-1">일 연속</div>
            </div>
            <button
              onClick={() => openBrowse({ type: "today" })}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all"
            >
              <div className="text-2xl font-bold text-zinc-200 mt-2">{todayCount}</div>
              <div className="text-xs text-zinc-500 mt-1">오늘 학습</div>
            </button>
            <button
              onClick={() => openBrowse({ type: "completed" })}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all"
            >
              <div className="text-2xl font-bold text-zinc-200 mt-2">{completedCount}/{totalQ}</div>
              <div className="text-xs text-zinc-500 mt-1">완료</div>
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-zinc-400 font-semibold whitespace-nowrap">{progress}% 달성</span>
          </div>

          {/* Main CTA */}
          <button
            onClick={() => { const q = pickRandom(); if (q) startStudy(q); }}
            className="w-full py-[18px] text-[17px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[14px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
          >
            ⚡ 오늘의 랜덤 문제 풀기
          </button>

          {/* Bookmark */}
          {bookmarkCount > 0 && (
            <button
              onClick={() => openBrowse({ type: "bookmarks" })}
              className="w-full mt-3 py-3.5 text-[15px] font-semibold text-amber-400 bg-amber-400/[0.08] border border-amber-400/25 rounded-xl hover:bg-amber-400/15 transition-all cursor-pointer"
            >
              🔖 북마크 모아보기 ({bookmarkCount}문제)
            </button>
          )}

          {/* Categories */}
          <div className="mt-8 mb-3.5 text-base font-bold text-zinc-400 tracking-tight">카테고리별 학습</div>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {CATEGORIES.map((cat) => {
              const catQs = QUESTIONS.filter((q) => q.category === cat);
              const catDone = catQs.filter((q) => completed.has(q.id)).length;
              const pct = Math.round((catDone / catQs.length) * 100);
              const color = CAT_COLORS[cat] || "#888";
              return (
                <button
                  key={cat}
                  onClick={() => openBrowse({ type: "category", category: cat })}
                  className="flex flex-col items-start gap-1 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-all text-left cursor-pointer"
                  style={{ borderColor: color + "33" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[13px] font-semibold text-zinc-200">{cat}</span>
                  <span className="text-xs text-zinc-500">{catDone}/{catQs.length}</span>
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => openBrowse({ type: "all" })}
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
    let basePool = QUESTIONS.slice();
    let browseTitle = "전체 질문";
    let showFilters = true;

    switch (browseMode.type) {
      case "today":
        basePool = QUESTIONS.filter((q) => todayIds.has(q.id));
        browseTitle = "오늘 학습한 문제";
        showFilters = false;
        break;
      case "completed":
        basePool = QUESTIONS.filter((q) => completed.has(q.id));
        browseTitle = "완료한 문제";
        break;
      case "bookmarks":
        basePool = QUESTIONS.filter((q) => bookmarks.has(q.id));
        browseTitle = "북마크한 문제";
        break;
      case "category":
        basePool = QUESTIONS.filter((q) => q.category === browseMode.category);
        browseTitle = browseMode.category;
        break;
    }

    let filtered = basePool;
    if (showFilters) {
      if (filterCat !== "all") filtered = filtered.filter((q) => q.category === filterCat);
      if (filterDiff !== "all") filtered = filtered.filter((q) => q.difficulty === Number(filterDiff));
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <button onClick={() => setView("home")} className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none">
            ← 홈으로
          </button>

          <h2 className="text-[22px] font-extrabold flex items-center gap-2.5 mb-4">
            {browseTitle}
            <span className="text-sm font-medium text-zinc-500">{filtered.length}문제</span>
          </h2>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">
                {browseMode.type === "today" ? "📚" : browseMode.type === "bookmarks" ? "🔖" : "✨"}
              </div>
              <p className="text-zinc-400 text-sm">
                {browseMode.type === "today" ? "아직 오늘 학습한 문제가 없어요. 지금 시작해볼까요?"
                  : browseMode.type === "bookmarks" ? "아직 북마크한 문제가 없어요."
                  : browseMode.type === "completed" ? "아직 완료한 문제가 없어요. 첫 문제를 풀어보세요!"
                  : "조건에 맞는 문제가 없어요."}
              </p>
              <button
                onClick={() => { const q = pickRandom(); if (q) startStudy(q); }}
                className="mt-4 px-6 py-2.5 text-sm font-semibold text-indigo-400 bg-indigo-400/[0.08] border border-indigo-400/20 rounded-lg cursor-pointer hover:bg-indigo-400/15 transition-all"
              >
                랜덤 문제 풀기
              </button>
            </div>
          )}

          {showFilters && filtered.length > 0 && (
            <div className="flex gap-2.5 mb-5">
              {browseMode.type !== "category" && (
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer">
                  <option value="all">전체 카테고리</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer">
                <option value="all">전체 난이도</option>
                <option value="1">기초</option>
                <option value="2">중급</option>
                <option value="3">심화</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filtered.map((q) => {
              const isDone = completed.has(q.id);
              const isBk = bookmarks.has(q.id);
              return (
                <div key={q.id} className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-4"
                  style={{ opacity: browseMode.type === "completed" ? 1 : isDone ? 0.6 : 1 }}>
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <DiffBadge difficulty={q.difficulty} />
                    <span className="text-xs font-semibold" style={{ color: CAT_COLORS[q.category] }}>{q.category}</span>
                    {isDone && browseMode.type !== "completed" && (
                      <span className="text-xs text-emerald-400 font-semibold">✓ 완료</span>
                    )}
                    <button onClick={() => toggleBookmark(q.id)}
                      className="ml-auto text-lg bg-transparent border-none cursor-pointer leading-none"
                      style={{ color: isBk ? "#fbbf24" : "#555" }}>
                      {isBk ? "★" : "☆"}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 mb-3">{q.question}</p>
                  <button onClick={() => startStudy(q)}
                    className="text-[13px] font-semibold text-indigo-400 bg-indigo-400/[0.08] border border-indigo-400/20 rounded-lg px-4 py-2 hover:bg-indigo-400/15 transition-all cursor-pointer">
                    {isDone ? "다시 학습하기" : "학습하기"}
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
          <button onClick={() => setView("home")} className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none">
            ← 홈으로
          </button>

          {reviewMode && (
            <div className="bg-amber-400/10 text-amber-400 px-4 py-2.5 rounded-[10px] text-sm font-semibold mb-4 text-center">
              🔖 북마크 복습 모드
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.05] border border-indigo-500/20 rounded-[18px] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <DiffBadge difficulty={currentQ.difficulty} />
              <span className="text-xs font-semibold" style={{ color: CAT_COLORS[currentQ.category] }}>{currentQ.category}</span>
              <button onClick={() => toggleBookmark(currentQ.id)}
                className="ml-auto text-[22px] bg-transparent border-none cursor-pointer leading-none"
                style={{ color: isBk ? "#fbbf24" : "#666" }}>
                {isBk ? "★" : "☆"}
              </button>
            </div>
            <h3 className="text-[17px] font-semibold leading-[1.7] text-zinc-100">{currentQ.question}</h3>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold text-zinc-400 mb-2.5">나의 답변</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="면접처럼 답변을 작성해보세요..." rows={6}
              className="w-full px-4 py-4 text-[15px] leading-[1.7] text-zinc-200 bg-white/[0.04] border border-white/10 rounded-[14px] outline-none resize-y min-h-[140px]" />
            <div className="flex gap-2.5 mt-3">
              <button disabled={!answer.trim() || loadingFeedback} onClick={requestFeedback}
                className="flex-1 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-default">
                {loadingFeedback ? "⏳ AI 분석 중..." : "🤖 AI 피드백 받기"}
              </button>
              <button
                onClick={async () => {
                  await markStudied();
                  const q = reviewMode ? pickRandom("all", "all", true) : pickRandom();
                  if (q) startStudy(q, reviewMode); else setView("home");
                }}
                className="px-5 py-3.5 text-sm font-semibold text-zinc-400 bg-white/[0.05] border border-white/10 rounded-xl whitespace-nowrap cursor-pointer hover:bg-white/[0.08] transition-all">
                다음 문제 →
              </button>
            </div>
          </div>

          {feedback && (
            <div className="bg-emerald-400/[0.06] border border-emerald-400/20 rounded-2xl p-5 mb-5">
              <div className="text-[15px] font-bold text-emerald-400 mb-3">🤖 AI 피드백</div>
              <pre className="text-sm leading-[1.75] text-zinc-300 whitespace-pre-wrap font-[inherit] m-0">{feedback}</pre>
            </div>
          )}

          {!completed.has(currentQ.id) && (
            <button onClick={async () => { await markStudied(); setView("home"); }}
              className="w-full py-4 text-base font-bold text-emerald-400 bg-emerald-400/[0.08] border border-emerald-400/25 rounded-[14px] cursor-pointer hover:bg-emerald-400/15 transition-all">
              ✓ 학습 완료
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function DiffBadge({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const colors = {
    1: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    2: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    3: "bg-rose-400/10 text-rose-400 border-rose-400/30",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${colors[difficulty]}`}>
      {DIFF_LABELS[difficulty]}
    </span>
  );
}
