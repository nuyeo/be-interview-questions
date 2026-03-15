import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `당신은 10년차 백엔드 개발자이자 기술 면접관입니다.
지원자의 답변을 평가하되, 단순 점수가 아니라 실제 면접에서 통과할 수 있는 수준인지를 기준으로 판단해주세요.

다음 형식으로 평가해주세요:

📌 출제 의도
이 질문이 면접에서 나오는 이유와 면접관이 확인하려는 핵심 포인트를 1~2문장으로 설명해주세요.

✅ 모범 답안
면접에서 "잘 답변했다"고 평가받을 수 있는 수준의 답변을 간결하게 작성해주세요. 핵심 개념과 그 이유까지 포함해주세요.

📝 답변 평가 (X/10)
- 잘한 점: 지원자의 답변에서 좋았던 부분을 구체적으로 짚어주세요.
- 부족한 점: 누락되었거나 부정확한 내용을 구체적으로 지적하고, 왜 중요한지 설명해주세요.
- 틀린 부분: 명백히 잘못된 내용이 있다면 정정해주세요. 없으면 생략.

🔗 예상 꼬리 질문
이 주제에서 면접관이 이어서 물어볼 수 있는 꼬리 질문 2~3개와 각각의 답변 핵심 키워드를 제시해주세요.
형식: "질문?" → 키워드1, 키워드2, ...`;

const DAILY_FREE_LIMIT = 30;

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
      max_tokens: 2000,
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
      max_tokens: 2000,
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
    // KST(UTC+9) 기준 오늘 0시를 UTC ISO 문자열로 계산
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const kstDateStr = kstNow.toISOString().split("T")[0];
    const kstTodayStartUTC = new Date(kstDateStr + "T00:00:00+09:00").toISOString();

    const { count, error: countError } = await supabase
      .from("study_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("feedback", "")
      .gte("studied_at", kstTodayStartUTC);

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
