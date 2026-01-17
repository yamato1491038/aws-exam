import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { saveAnswer } from '../utils/dynamo.js';
import { SaveAnswerRequest, CATEGORIES } from '../types/index.js';

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    // Cognito から userId を取得
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    const body: SaveAnswerRequest = JSON.parse(event.body || '{}');

    // バリデーション
    if (!body.questionId || !body.questionText || !body.choices || !body.userAnswers || !body.correctAnswers) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (!CATEGORIES[body.category]) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid category' })
      };
    }

    // 正誤判定
    const isCorrect =
      body.userAnswers.length === body.correctAnswers.length &&
      body.userAnswers.every((a) => body.correctAnswers.includes(a));

    const answer = await saveAnswer(userId, {
      questionId: body.questionId,
      questionText: body.questionText,
      questionType: body.questionType,
      choices: body.choices,
      userAnswers: body.userAnswers,
      correctAnswers: body.correctAnswers,
      isCorrect,
      explanation: body.explanation,
      category: body.category,
      createdAt: ''
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer)
    };
  } catch (error) {
    console.error('Error saving answer:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to save answer',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
