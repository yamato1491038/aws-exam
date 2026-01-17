import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { CATEGORIES } from '../types/index.js';

export async function handler(): Promise<APIGatewayProxyResultV2> {
  const categories = Object.values(CATEGORIES);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categories)
  };
}
