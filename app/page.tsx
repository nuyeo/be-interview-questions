"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchStudyRecords,
  upsertStudyRecord,
  fetchBookmarks,
  addBookmark,
  removeBookmark,
  type StudyRecord,
} from "@/lib/db";
import {
  QUESTIONS,
  CATEGORIES,
  DIFF_LABELS,
  CAT_COLORS,
  type Question,
} from "@/data/questions";

type BrowseMode =
  | { type: "all" }
  | { type: "category"; category: string }
  | { type: "today" }
  | { type: "completed" }
  | { type: "bookmarks" };

type UserProfile = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  login?: string;
};

// ─── Helpers ───
function getToday() {
  return new Date().toISOString().split("T")[0];
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Home() {
  // View
  const [view, setView] = useState<"home" | "browse" | "study">("home");
  const [browseMode, setBrowseMode] = useState<BrowseMode>({ type: "all" });

  // Auth
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data (Supabase-backed for logged-in users)
  const [records, setRecords] = useState<Map<number, StudyRecord>>(new Map());
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);

  // Study session
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Filters
  const [filterCat, setFilterCat] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");

  // Preferences (localStorage)
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(CATEGORIES));
  const [customApiKey, setCustomApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Browse expand
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ─── Close dropdown ───
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ─── Auth ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
          avatar: u.user_metadata?.avatar_url,
          login: u.user_metadata?.user_name || u.user_metadata?.preferred_username,
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email ?? undefined,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
          avatar: u.user_metadata?.avatar_url,
          login: u.user_metadata?.user_name || u.user_metadata?.preferred_username,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Load data from Supabase (logged in) or localStorage (guest) ───
  useEffect(() => {
    async function load() {
      if (user) {
        // Supabase
        const [recs, bks] = await Promise.all([
          fetchStudyRecords(user.id),
          fetchBookmarks(user.id),
        ]);
        const recMap = new Map<number, StudyRecord>();
        recs.forEach((r) => recMap.set(r.question_id, r));
        setRecords(recMap);
        setBookmarks(new Set(bks));
      } else {
        // localStorage fallback for guests
        const cp = loadJSON<{ qid: number; answer: string; feedback: string; date: string }[]>("guestRecords", []);
        const recMap = new Map<number, StudyRecord>();
        cp.forEach((r) => recMap.set(r.qid, { question_id: r.qid, answer: r.answer, feedback: r.feedback, studied_at: r.date }));
        setRecords(recMap);
        setBookmarks(new Set(loadJSON<number[]>("bookmarks", [])));
      }

      // localStorage-only prefs
      setStreak(loadJSON("streak", 0));
      setLastStudyDate(loadJSON<string | null>("lastStudyDate", null));
      setSelectedCategories(new Set(loadJSON<string[]>("selectedCategories", CATEGORIES)));
      setCustomApiKey(loadJSON<string>("customApiKey", ""));

      // Check streak break
      const ld = loadJSON<string | null>("lastStudyDate", null);
      if (ld && ld !== getToday()) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (ld !== yesterday.toISOString().split("T")[0]) {
          setStreak(0);
          saveJSON("streak", 0);
        }
      }
      setDataLoaded(true);
    }
    if (!authLoading) load();
  }, [user, authLoading]);

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.origin } });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRecords(new Map());
    setBookmarks(new Set());
    setDropdownOpen(false);
  };

  // ─── Derived state ───
  const activeQuestions = QUESTIONS.filter((q) => selectedCategories.has(q.category));
  const completed = new Set(records.keys());
  const todayIds = new Set(
    [...records.entries()]
      .filter(([, r]) => r.studied_at.startsWith(getToday()))
      .map(([qid]) => qid)
  );
  const todayCount = todayIds.size;
  const completedInActive = activeQuestions.filter((q) => completed.has(q.id)).length;
  const bookmarkCount = QUESTIONS.filter((q) => bookmarks.has(q.id)).length;
  const totalQ = activeQuestions.length;
  const progress = totalQ > 0 ? Math.round((completedInActive / totalQ) * 100) : 0;

  // ─── Actions ───
  const pickRandom = useCallback(
    (cat = "all", diff = "all", review = false) => {
      let pool = review ? activeQuestions.filter((q) => bookmarks.has(q.id)) : activeQuestions;
      if (cat !== "all") pool = pool.filter((q) => q.category === cat);
      if (diff !== "all") pool = pool.filter((q) => q.difficulty === Number(diff));
      if (pool.length === 0) return null;
      const unseen = pool.filter((q) => !completed.has(q.id));
      const final = unseen.length > 0 ? unseen : pool;
      return final[Math.floor(Math.random() * final.length)];
    },
    [bookmarks, completed, activeQuestions]
  );

  const startStudy = (q: Question, isReview = false) => {
    setCurrentQ(q);
    // Pre-fill with previous answer if re-studying
    const prev = records.get(q.id);
    setAnswer(prev?.answer || "");
    setFeedback(null);
    setReviewMode(isReview);
    setView("study");
  };

  const saveRecord = async (qId: number, ans: string, fb: string) => {
    const now = new Date().toISOString();
    const rec: StudyRecord = { question_id: qId, answer: ans, feedback: fb, studied_at: now };

    // Update local state immediately
    setRecords((prev) => new Map(prev).set(qId, rec));

    if (user) {
      await upsertStudyRecord(user.id, qId, ans, fb);
    } else {
      // Guest: save to localStorage
      const all = [...records.values(), rec].reduce((map, r) => {
        map.set(r.question_id, r);
        return map;
      }, new Map<number, StudyRecord>());
      saveJSON("guestRecords", [...all.values()].map((r) => ({
        qid: r.question_id, answer: r.answer, feedback: r.feedback, date: r.studied_at,
      })));
    }

    // Streak
    const today = getToday();
    if (lastStudyDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastStudyDate(today);
      saveJSON("streak", newStreak);
      saveJSON("lastStudyDate", today);
    }
  };

  const toggleBookmarkAction = async (qId: number) => {
    const newBk = new Set(bookmarks);
    if (newBk.has(qId)) {
      newBk.delete(qId);
      if (user) removeBookmark(user.id, qId);
    } else {
      newBk.add(qId);
      if (user) addBookmark(user.id, qId);
    }
    setBookmarks(newBk);
    if (!user) saveJSON("bookmarks", [...newBk]);
  };

  const toggleCategory = (cat: string) => {
    const c = new Set(selectedCategories);
    if (c.has(cat)) { if (c.size <= 1) return; c.delete(cat); } else c.add(cat);
    setSelectedCategories(c);
    saveJSON("selectedCategories", [...c]);
  };
  const selectAllCategories = () => { setSelectedCategories(new Set(CATEGORIES)); saveJSON("selectedCategories", CATEGORIES); };
  const saveApiKey = () => { const k = apiKeyInput.trim(); setCustomApiKey(k); saveJSON("customApiKey", k); setShowApiKeySettings(false); };
  const removeApiKeyAction = () => { setCustomApiKey(""); setApiKeyInput(""); saveJSON("customApiKey", ""); };

  const requestFeedback = async () => {
    if (!answer.trim() || !currentQ) return;
    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQ.question, answer, customApiKey: customApiKey || undefined }),
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
    setExpandedId(null);
    setView("browse");
  };

  if (!dataLoaded || authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  // ━━━ Profile Area ━━━
  const ProfileArea = () => (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all cursor-pointer bg-transparent border-none">
            {user.avatar && <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />}
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-zinc-300 max-w-[100px] truncate">{user.login || user.name}</div>
            </div>
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="text-sm font-semibold text-zinc-200">{user.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">@{user.login || user.email}</div>
              </div>
              <div className="py-1">
                <button onClick={() => { setDropdownOpen(false); openBrowse({ type: "bookmarks" }); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors flex items-center gap-2.5 cursor-pointer bg-transparent border-none">
                  <span className="text-base">🔖</span> 북마크 ({bookmarkCount})
                </button>
                <button onClick={() => { setDropdownOpen(false); setShowCategorySettings(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors flex items-center gap-2.5 cursor-pointer bg-transparent border-none">
                  <span className="text-base">📂</span> 카테고리 설정
                </button>
                <button onClick={() => { setDropdownOpen(false); setApiKeyInput(customApiKey); setShowApiKeySettings(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors flex items-center gap-2.5 cursor-pointer bg-transparent border-none">
                  <span className="text-base">🤖</span> AI 토큰 등록
                  {customApiKey && <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">등록됨</span>}
                </button>
              </div>
              <div className="border-t border-white/[0.06] py-1">
                <button onClick={signOut} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/[0.06] transition-colors cursor-pointer bg-transparent border-none">
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <button onClick={signInWithGitHub}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-200 bg-white/[0.06] border border-white/10 rounded-lg hover:bg-white/[0.1] transition-all cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
          GitHub 로그인
        </button>
      )}
    </div>
  );

  // ━━━ Category Modal ━━━
  const CategoryModal = () => {
    if (!showCategorySettings) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCategorySettings(false)}>
        <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100">카테고리 설정</h3>
            <button onClick={selectAllCategories} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer bg-transparent border-none">전체 선택</button>
          </div>
          <div className="p-4 space-y-1.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategories.has(cat);
              const color = CAT_COLORS[cat] || "#888";
              const count = QUESTIONS.filter((q) => q.category === cat).length;
              return (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer border-none text-left ${active ? "bg-white/[0.06]" : "bg-transparent opacity-40"}`}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: active ? color : "#555" }} />
                  <span className={`text-sm font-medium flex-1 ${active ? "text-zinc-200" : "text-zinc-500"}`}>{cat}</span>
                  <span className="text-xs text-zinc-500">{count}문제</span>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${active ? "border-indigo-400 bg-indigo-400" : "border-zinc-600"}`}>
                    {active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-white/[0.06]">
            <button onClick={() => setShowCategorySettings(false)} className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl cursor-pointer border-none">
              완료 ({selectedCategories.size}개 선택)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ━━━ API Key Modal ━━━
  const ApiKeyModal = () => {
    if (!showApiKeySettings) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowApiKeySettings(false)}>
        <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-lg font-bold text-zinc-100">AI 토큰 등록</h3>
            <p className="text-xs text-zinc-500 mt-1">본인의 API 키를 등록하면 더 좋은 AI 피드백을 받을 수 있어요.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className={`px-4 py-3 rounded-xl text-sm ${customApiKey ? "bg-emerald-400/[0.06] border border-emerald-400/20 text-emerald-400" : "bg-zinc-800 border border-white/[0.06] text-zinc-400"}`}>
              {customApiKey ? (
                <div className="flex items-center justify-between">
                  <span>✓ 키 등록됨 ({customApiKey.startsWith("sk-ant-") ? "Anthropic" : "OpenAI"})</span>
                  <button onClick={removeApiKeyAction} className="text-xs text-red-400 cursor-pointer bg-transparent border-none">삭제</button>
                </div>
              ) : <span>기본 GPT-4o-mini가 사용됩니다 (무료)</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">API Key</label>
              <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="sk-ant-... 또는 sk-..."
                className="w-full px-4 py-3 text-sm text-zinc-200 bg-white/[0.04] border border-white/10 rounded-xl outline-none placeholder:text-zinc-600" />
              <p className="text-[11px] text-zinc-600 mt-2">키는 브라우저에만 저장되며 서버에 저장되지 않습니다.</p>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-white/[0.06] flex gap-2.5">
            <button onClick={() => setShowApiKeySettings(false)} className="flex-1 py-3 text-sm font-semibold text-zinc-400 bg-white/[0.05] border border-white/10 rounded-xl cursor-pointer">취소</button>
            <button onClick={saveApiKey} disabled={!apiKeyInput.trim()} className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl cursor-pointer border-none disabled:opacity-40">저장</button>
          </div>
        </div>
      </div>
    );
  };

  // ━━━ HOME ━━━
  if (view === "home") {
    return (
      <div className="min-h-screen"><CategoryModal /><ApiKeyModal />
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">CS 면접 마스터</h1>
              <p className="mt-1.5 text-sm text-zinc-500">매일 한 문제, 백엔드 면접 준비</p>
            </div>
            <ProfileArea />
          </div>

          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-gradient-to-br from-orange-500/10 to-amber-500/8 border border-amber-500/20 rounded-2xl p-4 text-center">
              <div className="text-[28px] animate-fire">🔥</div>
              <div className="text-[32px] font-extrabold text-amber-400 leading-none">{streak}</div>
              <div className="text-xs text-zinc-400 mt-1">일 연속</div>
            </div>
            <button onClick={() => openBrowse({ type: "today" })} className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all">
              <div className="text-2xl font-bold text-zinc-200 mt-2">{todayCount}</div>
              <div className="text-xs text-zinc-500 mt-1">오늘 학습</div>
            </button>
            <button onClick={() => openBrowse({ type: "completed" })} className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all">
              <div className="text-2xl font-bold text-zinc-200 mt-2">{completedInActive}/{totalQ}</div>
              <div className="text-xs text-zinc-500 mt-1">완료</div>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-zinc-400 font-semibold whitespace-nowrap">{progress}% 달성</span>
          </div>

          <button onClick={() => { const q = pickRandom(); if (q) startStudy(q); }}
            className="w-full py-[18px] text-[17px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[14px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all cursor-pointer">
            ⚡ 오늘의 랜덤 문제 풀기
          </button>

          {bookmarkCount > 0 && (
            <button onClick={() => openBrowse({ type: "bookmarks" })}
              className="w-full mt-3 py-3.5 text-[15px] font-semibold text-amber-400 bg-amber-400/[0.08] border border-amber-400/25 rounded-xl hover:bg-amber-400/15 transition-all cursor-pointer">
              🔖 북마크 모아보기 ({bookmarkCount}문제)
            </button>
          )}

          <div className="mt-8 mb-3.5 flex items-center justify-between">
            <span className="text-base font-bold text-zinc-400">카테고리별 학습</span>
            <button onClick={() => setShowCategorySettings(true)} className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer bg-transparent border-none">설정 ⚙️</button>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategories.has(cat);
              const catQs = QUESTIONS.filter((q) => q.category === cat);
              const catDone = catQs.filter((q) => completed.has(q.id)).length;
              const pct = Math.round((catDone / catQs.length) * 100);
              const color = CAT_COLORS[cat] || "#888";
              return (
                <button key={cat} onClick={() => { if (active) openBrowse({ type: "category", category: cat }); }}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl transition-all text-left border ${active ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] cursor-pointer" : "bg-white/[0.01] border-white/[0.04] opacity-35 cursor-default"}`}
                  style={{ borderColor: active ? color + "33" : undefined }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: active ? color : "#555" }} />
                  <span className={`text-[13px] font-semibold ${active ? "text-zinc-200" : "text-zinc-600"}`}>{cat}</span>
                  <span className="text-xs text-zinc-500">{catDone}/{catQs.length}</span>
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: active ? color : "#555" }} />
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => openBrowse({ type: "all" })} className="w-full py-3 text-sm font-semibold text-indigo-400 border border-indigo-400/20 rounded-[10px] hover:bg-indigo-400/[0.06] transition-all cursor-pointer">전체 질문 보기 →</button>
        </div>
      </div>
    );
  }

  // ━━━ BROWSE ━━━
  if (view === "browse") {
    let basePool = activeQuestions;
    let browseTitle = "전체 질문";
    let showFilters = true;

    switch (browseMode.type) {
      case "today": basePool = QUESTIONS.filter((q) => todayIds.has(q.id)); browseTitle = "오늘 학습한 문제"; showFilters = false; break;
      case "completed": basePool = QUESTIONS.filter((q) => completed.has(q.id)); browseTitle = "완료한 문제"; break;
      case "bookmarks": basePool = QUESTIONS.filter((q) => bookmarks.has(q.id)); browseTitle = "북마크한 문제"; break;
      case "category": basePool = QUESTIONS.filter((q) => q.category === browseMode.category); browseTitle = browseMode.category; break;
    }

    let filtered = basePool;
    if (showFilters) {
      if (filterCat !== "all") filtered = filtered.filter((q) => q.category === filterCat);
      if (filterDiff !== "all") filtered = filtered.filter((q) => q.difficulty === Number(filterDiff));
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <button onClick={() => setView("home")} className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none">← 홈으로</button>
          <h2 className="text-[22px] font-extrabold flex items-center gap-2.5 mb-4">
            {browseTitle}<span className="text-sm font-medium text-zinc-500">{filtered.length}문제</span>
          </h2>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">{browseMode.type === "today" ? "📚" : browseMode.type === "bookmarks" ? "🔖" : "✨"}</div>
              <p className="text-zinc-400 text-sm">
                {browseMode.type === "today" ? "아직 오늘 학습한 문제가 없어요." : browseMode.type === "bookmarks" ? "아직 북마크한 문제가 없어요." : browseMode.type === "completed" ? "아직 완료한 문제가 없어요." : "조건에 맞는 문제가 없어요."}
              </p>
              <button onClick={() => { const q = pickRandom(); if (q) startStudy(q); }}
                className="mt-4 px-6 py-2.5 text-sm font-semibold text-indigo-400 bg-indigo-400/[0.08] border border-indigo-400/20 rounded-lg cursor-pointer hover:bg-indigo-400/15 transition-all">랜덤 문제 풀기</button>
            </div>
          )}

          {showFilters && filtered.length > 0 && (
            <div className="flex gap-2.5 mb-5">
              {browseMode.type !== "category" && (
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer">
                  <option value="all">전체 카테고리</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className="flex-1 px-3.5 py-2.5 text-sm bg-white/[0.05] border border-white/10 rounded-[10px] text-zinc-200 outline-none cursor-pointer">
                <option value="all">전체 난이도</option><option value="1">기초</option><option value="2">중급</option><option value="3">심화</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filtered.map((q) => {
              const isDone = completed.has(q.id);
              const isBk = bookmarks.has(q.id);
              const rec = records.get(q.id);
              const isExpanded = expandedId === q.id;

              return (
                <div key={q.id} className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-4">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <DiffBadge difficulty={q.difficulty} />
                    <span className="text-xs font-semibold" style={{ color: CAT_COLORS[q.category] }}>{q.category}</span>
                    {isDone && rec && <span className="text-xs text-zinc-500">{formatDate(rec.studied_at)}</span>}
                    <button onClick={() => toggleBookmarkAction(q.id)} className="ml-auto text-lg bg-transparent border-none cursor-pointer leading-none" style={{ color: isBk ? "#fbbf24" : "#555" }}>
                      {isBk ? "★" : "☆"}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 mb-3">{q.question}</p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => startStudy(q)}
                      className="text-[13px] font-semibold text-indigo-400 bg-indigo-400/[0.08] border border-indigo-400/20 rounded-lg px-4 py-2 hover:bg-indigo-400/15 transition-all cursor-pointer">
                      {isDone ? "다시 학습하기" : "학습하기"}
                    </button>
                    {isDone && rec?.answer && (
                      <button onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="text-[13px] font-semibold text-zinc-500 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 hover:bg-white/[0.08] transition-all cursor-pointer">
                        {isExpanded ? "접기 ▲" : "내 답변 보기 ▼"}
                      </button>
                    )}
                  </div>

                  {/* Expanded answer + feedback */}
                  {isExpanded && rec && (
                    <div className="mt-3 space-y-3">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="text-xs font-semibold text-zinc-500 mb-2">📝 내 답변</div>
                        <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{rec.answer}</p>
                      </div>
                      {rec.feedback && (
                        <div className="bg-emerald-400/[0.04] border border-emerald-400/15 rounded-xl p-4">
                          <div className="text-xs font-semibold text-emerald-400 mb-2">🤖 AI 피드백</div>
                          <pre className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-[inherit] m-0">{rec.feedback}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ━━━ STUDY ━━━
  if (view === "study" && currentQ) {
    const isBk = bookmarks.has(currentQ.id);
    const handleComplete = async () => {
      await saveRecord(currentQ.id, answer, feedback || "");
      setView("home");
    };
    const handleNext = async () => {
      if (answer.trim()) await saveRecord(currentQ.id, answer, feedback || "");
      const q = reviewMode ? pickRandom("all", "all", true) : pickRandom();
      if (q) startStudy(q, reviewMode); else setView("home");
    };

    return (
      <div className="min-h-screen">
        <div className="max-w-[640px] mx-auto px-5 py-6 pb-16">
          <button onClick={() => setView("home")} className="text-indigo-400 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none">← 홈으로</button>
          {reviewMode && <div className="bg-amber-400/10 text-amber-400 px-4 py-2.5 rounded-[10px] text-sm font-semibold mb-4 text-center">🔖 북마크 복습 모드</div>}

          <div className="bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.05] border border-indigo-500/20 rounded-[18px] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <DiffBadge difficulty={currentQ.difficulty} />
              <span className="text-xs font-semibold" style={{ color: CAT_COLORS[currentQ.category] }}>{currentQ.category}</span>
              <button onClick={() => toggleBookmarkAction(currentQ.id)} className="ml-auto text-[22px] bg-transparent border-none cursor-pointer leading-none" style={{ color: isBk ? "#fbbf24" : "#666" }}>
                {isBk ? "★" : "☆"}
              </button>
            </div>
            <h3 className="text-[17px] font-semibold leading-[1.7] text-zinc-100">{currentQ.question}</h3>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold text-zinc-400 mb-2.5">나의 답변</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="면접처럼 답변을 작성해보세요..." rows={6}
              className="w-full px-4 py-4 text-[15px] leading-[1.7] text-zinc-200 bg-white/[0.04] border border-white/10 rounded-[14px] outline-none resize-y min-h-[140px]" />
            <div className="flex gap-2.5 mt-3">
              <button disabled={!answer.trim() || loadingFeedback} onClick={requestFeedback}
                className="flex-1 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-default">
                {loadingFeedback ? "⏳ AI 분석 중..." : "🤖 AI 피드백 받기"}
              </button>
              <button onClick={handleNext}
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

          <button onClick={handleComplete}
            disabled={!answer.trim()}
            className="w-full py-4 text-base font-bold text-emerald-400 bg-emerald-400/[0.08] border border-emerald-400/25 rounded-[14px] cursor-pointer hover:bg-emerald-400/15 transition-all disabled:opacity-40 disabled:cursor-default">
            ✓ 학습 완료
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function DiffBadge({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const c = { 1: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30", 2: "bg-amber-400/10 text-amber-400 border-amber-400/30", 3: "bg-rose-400/10 text-rose-400 border-rose-400/30" };
  return <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${c[difficulty]}`}>{DIFF_LABELS[difficulty]}</span>;
}
