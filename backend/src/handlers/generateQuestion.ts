import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { generateQuestion } from '../utils/bedrock.js';
import { GenerateQuestionRequest, CATEGORIES, DomainId } from '../types/index.js';

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    const body: GenerateQuestionRequest = JSON.parse(event.body || '{}');
    const { domainId } = body;

    // バリデーション
    if (!domainId || !CATEGORIES[domainId]) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid domainId',
          validDomains: Object.keys(CATEGORIES)
        })
      };
    }

    const question = await generateQuestion(domainId as DomainId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    };
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to generate question',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
