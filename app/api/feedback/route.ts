import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `당신은 백엔드 개발 기술 면접관입니다. 다음 질문에 대한 답변을 평가해주세요.
다음 형식으로 간결하게 평가해주세요 (전체 400자 이내):
1. 점수: X/10
2. 좋은 점: (1~2문장)
3. 보완할 점: (1~2문장)
4. 모범 답변 핵심 키워드: (쉼표로 구분하여 나열)`;

const DAILY_FREE_LIMIT = 1;

export async function POST(request: Request) {
  const { question, answer, customApiKey } = await request.json();

  if (!answer?.trim() || !question?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // ─── Auth check ───
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "로그인 후 AI 피드백을 사용할 수 있어요." }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "인증에 실패했어요. 다시 로그인해주세요." }, { status: 401 });
  }

  // ─── Rate limit for users without custom key ───
  if (!customApiKey) {
    // Count today's feedback usage from study_records
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("study_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("feedback", "")
      .gte("studied_at", todayStart.toISOString());

    if (!countError && (count ?? 0) >= DAILY_FREE_LIMIT) {
      return NextResponse.json({
        error: `오늘의 무료 AI 피드백 ${DAILY_FREE_LIMIT}회를 모두 사용했어요. 설정에서 본인의 API 키를 등록하면 무제한으로 사용할 수 있어요.`,
      }, { status: 429 });
    }
  }

  const userPrompt = `질문: ${question}\n\n지원자의 답변:\n${answer}`;

  try {
    // Custom Anthropic key
    if (customApiKey?.startsWith("sk-ant-")) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": customApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
      return NextResponse.json({ feedback: data.content?.[0]?.text || "피드백을 받지 못했습니다.", provider: "claude" });
    }

    // Custom OpenAI key
    if (customApiKey?.startsWith("sk-")) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${customApiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }],
        }),
      });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
      return NextResponse.json({ feedback: data.choices?.[0]?.message?.content || "피드백을 받지 못했습니다.", provider: "gpt-custom" });
    }

    // Default: server GPT-4o-mini
    const defaultKey = process.env.OPENAI_API_KEY;
    if (!defaultKey) {
      return NextResponse.json({ error: "서버에 기본 AI 키가 설정되지 않았어요." }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${defaultKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
    return NextResponse.json({ feedback: data.choices?.[0]?.message?.content || "피드백을 받지 못했습니다.", provider: "gpt-default" });
  } catch {
    return NextResponse.json({ error: "AI 피드백 요청 실패" }, { status: 500 });
  }
}
