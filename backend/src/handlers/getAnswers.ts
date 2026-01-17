import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAnswers } from '../utils/dynamo.js';

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> {
  try {
    // Cognito から userId を取得
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    // クエリパラメータ
    const limit = parseInt(event.queryStringParameters?.limit || '20', 10);
    const lastKeyParam = event.queryStringParameters?.lastKey;
    const lastEvaluatedKey = lastKeyParam ? JSON.parse(decodeURIComponent(lastKeyParam)) : undefined;

    const result = await getAnswers(userId, limit, lastEvaluatedKey);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: result.items,
        lastKey: result.lastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey))
          : null
      })
    };
  } catch (error) {
    console.error('Error getting answers:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to get answers',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
