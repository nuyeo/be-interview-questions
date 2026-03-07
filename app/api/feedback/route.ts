import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question, answer } = await request.json();

  if (!answer?.trim() || !question?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `당신은 백엔드 개발 기술 면접관입니다. 다음 질문에 대한 답변을 평가해주세요.

질문: ${question}

지원자의 답변:
${answer}

다음 형식으로 간결하게 평가해주세요 (전체 400자 이내):
1. 점수: X/10
2. 좋은 점: (1~2문장)
3. 보완할 점: (1~2문장)
4. 모범 답변 핵심 키워드: (쉼표로 구분하여 나열)`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text =
      data.content?.[0]?.text || "피드백을 받지 못했습니다.";
    return NextResponse.json({ feedback: text });
  } catch {
    return NextResponse.json(
      { error: "AI 피드백 요청 실패" },
      { status: 500 }
    );
  }
}
