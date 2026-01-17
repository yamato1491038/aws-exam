import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime';
import { Question, DomainId, CATEGORIES } from '../types/index.js';

const client = new BedrockRuntimeClient({ region: 'ap-northeast-1' });

const SYSTEM_PROMPT = `あなたはAWS認定 Solutions Architect – Professional の講師です。

目的:
- 受験者の設計判断力を高めるための学習用模擬問題を作成すること

以下の条件で、オリジナルの模擬問題を1問作成してください。
- 出題レベル: SAP
- 単一サービス知識ではなく、複数サービスの設計判断を問う
- 形式: 以下のいずれか
  - 択一選択問題: 正しい選択肢が1つ、誤った選択肢(不正解)が3つ提示される
  - 複数選択問題: 5つ以上の選択肢のうち、正解が2つ以上ある。問題文に「2つ選択してください」等の指示を含める
- 解説付き

重要: 出力はJSON形式のみで、余計なテキストは含めないでください。

出力形式（JSON）:
{
  "questionId": "生成したUUID",
  "question": "問題文（シナリオ含む）",
  "questionType": "single または multiple",
  "choices": ["A. 選択肢1", "B. 選択肢2", "C. 選択肢3", "D. 選択肢4"],
  "correctAnswers": ["A"] または ["A", "C"],
  "explanation": "詳細な解説（各選択肢の評価含む）",
  "category": "domainX"
}`;

export async function generateQuestion(domainId: DomainId): Promise<Question> {
  const category = CATEGORIES[domainId];

  const userPrompt = `カテゴリ: ${category.name}

上記カテゴリに関する問題を1問作成してください。`;

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-5-20241022-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  // Claude's response is in content[0].text
  const text = responseBody.content[0].text;

  // JSONを抽出（```json ... ``` で囲まれている場合も対応）
  let jsonStr = text;
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    // { から始まり } で終わる部分を抽出
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = text.slice(startIdx, endIdx + 1);
    }
  }

  const question: Question = JSON.parse(jsonStr);

  // カテゴリを確実に設定
  question.category = domainId;

  return question;
}
