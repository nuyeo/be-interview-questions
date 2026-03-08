import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 백엔드 개발 기술 면접관입니다. 다음 질문에 대한 답변을 평가해주세요.
다음 형식으로 간결하게 평가해주세요 (전체 400자 이내):
1. 점수: X/10
2. 좋은 점: (1~2문장)
3. 보완할 점: (1~2문장)
4. 모범 답변 핵심 키워드: (쉼표로 구분하여 나열)`;

export async function POST(request: Request) {
  const { question, answer, customApiKey } = await request.json();

  if (!answer?.trim() || !question?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userPrompt = `질문: ${question}\n\n지원자의 답변:\n${answer}`;

  try {
    // Custom Anthropic key → use Claude
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
      if (data.error) {
        return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
      }
      const text = data.content?.[0]?.text || "피드백을 받지 못했습니다.";
      return NextResponse.json({ feedback: text, provider: "claude" });
    }

    // Custom OpenAI key → use user's own GPT
    if (customApiKey?.startsWith("sk-")) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
      }
      const text = data.choices?.[0]?.message?.content || "피드백을 받지 못했습니다.";
      return NextResponse.json({ feedback: text, provider: "gpt-custom" });
    }

    // No custom key → use server default (OPENAI_API_KEY env for gpt-4o-mini)
    const defaultKey = process.env.OPENAI_API_KEY;
    if (!defaultKey) {
      return NextResponse.json({
        error: "AI 피드백을 사용하려면 설정에서 API 키를 등록해주세요.",
      }, { status: 400 });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${defaultKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: `API 오류: ${data.error.message}` }, { status: 400 });
    }
    const text = data.choices?.[0]?.message?.content || "피드백을 받지 못했습니다.";
    return NextResponse.json({ feedback: text, provider: "gpt-default" });
  } catch {
    return NextResponse.json({ error: "AI 피드백 요청 실패" }, { status: 500 });
  }
}
