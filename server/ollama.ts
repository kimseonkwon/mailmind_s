import type { ExtractedEvent } from "@shared/schema";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function chatWithOllama(
  messages: OllamaMessage[],
  model: string = "llama3.2"
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Ollama chat error:", error);
    throw new Error("AI 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인해주세요.");
  }
}

export async function extractEventsFromEmail(
  emailSubject: string,
  emailBody: string,
  emailDate: string
): Promise<ExtractedEvent[]> {
  const systemPrompt = `당신은 이메일에서 일정/이벤트 정보를 추출하는 AI 비서입니다.
이메일 내용을 분석하여 일정 정보를 JSON 형식으로 추출해주세요.

반드시 다음 JSON 배열 형식으로만 응답하세요:
[
  {
    "title": "일정 제목",
    "startDate": "YYYY-MM-DD HH:mm",
    "endDate": "YYYY-MM-DD HH:mm",
    "location": "장소",
    "description": "설명"
  }
]

일정이 없으면 빈 배열 []을 반환하세요.
날짜가 명시되지 않은 경우 이메일 날짜(${emailDate})를 기준으로 추정하세요.`;

  const userPrompt = `다음 이메일에서 일정 정보를 추출해주세요:

제목: ${emailSubject}

내용:
${emailBody}`;

  try {
    const response = await chatWithOllama([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const events = JSON.parse(jsonMatch[0]);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error("Event extraction error:", error);
    return [];
  }
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}
