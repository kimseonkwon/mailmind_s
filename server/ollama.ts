import type { ExtractedEvent } from "@shared/schema";
import { type RagSearchResult } from "@shared/schema";

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

// 임베딩 생성 함수
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const cleanText = text.replace(/\n/g, " ");
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: cleanText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding; 
  } catch (error) {
    console.error("Embedding generation error:", error);
    return [];
  }
}

// 기본 채팅 함수
export async function chatWithOllama(
  messages: OllamaMessage[],
  model: string = "llama3" 
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.1, // 사실 기반 답변을 위해 창의성 억제
        }
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

// [핵심 수정] RAG 프롬프트가 강력하게 적용된 함수
export async function chatWithEmailContext(
  userQuestion: string,
  retrievedChunks: RagSearchResult[]
): Promise<string> {
  
  // 1. 참고자료 포맷팅 (날짜 정보 추가, 가독성 개선)
  const contextText = retrievedChunks.map((chunk, index) => `
[[자료 ${index + 1}]]
- Mail ID: ${chunk.mailId}
- 제목: ${chunk.subject}
- 내용: "${chunk.content.replace(/\n/g, " ").replace(/"/g, "'")}"
`).join("\n");

  // 2. 시스템 프롬프트 (한국어 강제 및 출처 표기 강화)
  const SYSTEM_PROMPT = `
You are a highly intelligent secretary for a Korean user. 
Your task is to answer the user's question based *strictly* on the provided [참고자료] (Reference Materials).

### 🚨 CRITICAL RULES (MUST FOLLOW)
1. **LANGUAGE**: You MUST answer in **Korean (한국어)**. Never use English in the final output.
2. **EVIDENCE**: When you state a fact, append the source mail ID.
   - Format: "사실 내용 (메일 ID: 12)"
3. **NO HALLUCINATION**: If the answer is not in the [참고자료], say "제공된 메일 내용에서 관련 정보를 찾을 수 없습니다."
4. **VERIFICATION**: Check if the reference actually answers the specific question. If the topic matches but the specific detail is missing, say so.

### 답변 스타일 가이드
- 비즈니스 매너를 갖춘 정중한 한국어(해요체)를 사용하세요.
- 불필요한 서론("참고자료에 따르면...")을 줄이고, 핵심 결론부터 말하세요.
- 여러 메일의 정보가 섞여있다면, 항목별로 나누어 정리하세요.

### 예시
사용자: "다음 주 회의 일정 알려줘"
AI: "다음 주 회의 일정은 다음과 같습니다.
- **경영 전략 회의**: 10월 5일 오후 2시, 대회의실 (메일 ID: 5)
- **개발 팀 미팅**: 10월 7일 오전 10시 (메일 ID: 8)"
`;

  // 3. 메시지 구성
  const messages: OllamaMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { 
      role: "user", 
      content: `
[참고자료]
${contextText || "관련된 메일이 없습니다."}

[질문]
${userQuestion}

[지침]
위 참고자료를 바탕으로 한국어로 답변하세요. 각 정보의 출처(메일 ID)를 반드시 표기하세요.` 
    }
  ];

  return chatWithOllama(messages);
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

// 기존 분류 함수 유지
export async function classifyEmail(
  subject: string,
  body: string,
  sender: string
): Promise<{ classification: string; confidence: string }> {
  const systemPrompt = `당신은 이메일 분류 전문가입니다. 다음 카테고리 중 하나로 분류하세요:
- reference: 단순 참조
- reply_needed: 회신 필요
- urgent_reply: 긴급 회신
- meeting: 회의
JSON 응답: {"classification": "meeting", "confidence": "high"}`;

  const userPrompt = `발신자: ${sender}\n제목: ${subject}\n내용: ${body.substring(0, 500)}`;

  try {
    const response = await chatWithOllama([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { classification: "reference", confidence: "low" };
  } catch (error) {
    return { classification: "reference", confidence: "low" };
  }
}