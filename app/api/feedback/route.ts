import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `당신은 백엔드 개발 기술 면접관입니다. 다음 질문에 대한 답변을 평가해주세요.
다음 형식으로 간결하게 평가해주세요 (전체 400자 이내):
1. 점수: X/10
2. 좋은 점: (1~2문장)
3. 보완할 점: (1~2문장)
4. 모범 답변 핵심 키워드: (쉼표로 구분하여 나열)`;

const DAILY_FREE_LIMIT = 1;

const ANTHROPIC_MODELS = ["claude-haiku-4.5-20241022", "claude-sonnet-4-20250514"];
const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o"];

async function callAnthropic(apiKey: string, model: string, userPrompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "피드백을 받지 못했습니다.";
}

async function callOpenAI(apiKey: string, model: string, userPrompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "피드백을 받지 못했습니다.";
}

export async function POST(request: Request) {
  const { question, answer, customApiKey, model } = await request.json();

  if (!answer?.trim() || !question?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Auth check
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

  // Rate limit for default key users
  if (!customApiKey) {
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
        error: `오늘의 무료 AI 피드백 ${DAILY_FREE_LIMIT}회를 모두 사용했어요.\n설정에서 본인의 API 키를 등록하면 무제한으로 사용할 수 있어요.`,
      }, { status: 429 });
    }
  }

  const userPrompt = `질문: ${question}\n\n지원자의 답변:\n${answer}`;

  try {
    // Custom Anthropic key
    if (customApiKey?.startsWith("sk-ant-")) {
      const selectedModel = ANTHROPIC_MODELS.includes(model) ? model : "claude-haiku-4.5-20241022";
      const text = await callAnthropic(customApiKey, selectedModel, userPrompt);
      return NextResponse.json({ feedback: text, provider: "anthropic", model: selectedModel });
    }

    // Custom OpenAI key
    if (customApiKey?.startsWith("sk-")) {
      const selectedModel = OPENAI_MODELS.includes(model) ? model : "gpt-4o-mini";
      const text = await callOpenAI(customApiKey, selectedModel, userPrompt);
      return NextResponse.json({ feedback: text, provider: "openai", model: selectedModel });
    }

    // Default: server GPT-4o-mini (always cheapest)
    const defaultKey = process.env.OPENAI_API_KEY;
    if (!defaultKey) {
      return NextResponse.json({ error: "서버에 기본 AI 키가 설정되지 않았어요." }, { status: 500 });
    }
    const text = await callOpenAI(defaultKey, "gpt-4o-mini", userPrompt);
    return NextResponse.json({ feedback: text, provider: "openai-default", model: "gpt-4o-mini" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 피드백 요청 실패";
    return NextResponse.json({ error: `API 오류: ${message}` }, { status: 500 });
  }
}
