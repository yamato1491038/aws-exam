import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { Answer, DomainId, StatsResponse } from '../types/index.js';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'sap-exam-answers-dev';

export async function saveAnswer(userId: string, answer: Omit<Answer, 'PK' | 'SK'>): Promise<Answer> {
  const now = new Date().toISOString();
  const item: Answer = {
    PK: `USER#${userId}`,
    SK: `ANSWER#${now}#${answer.questionId}`,
    ...answer,
    createdAt: now
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })
  );

  return item;
}

export async function getAnswers(
  userId: string,
  limit: number = 20,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<{ items: Answer[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'ANSWER#'
      },
      ScanIndexForward: false, // 新しい順
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    })
  );

  return {
    items: (result.Items || []) as Answer[],
    lastEvaluatedKey: result.LastEvaluatedKey
  };
}

export async function getAnswersByCategory(
  userId: string,
  category: DomainId
): Promise<Answer[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'PK = :pk AND category = :category',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':category': category
      }
    })
  );

  return (result.Items || []) as Answer[];
}

export async function getStats(userId: string): Promise<StatsResponse> {
  // 全回答を取得（ページネーション対応）
  const allAnswers: Answer[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await getAnswers(userId, 100, lastKey);
    allAnswers.push(...result.items);
    lastKey = result.lastEvaluatedKey;
  } while (lastKey);

  // 統計計算
  const totalAnswers = allAnswers.length;
  const correctAnswers = allAnswers.filter((a) => a.isCorrect).length;

  const categoryStats: StatsResponse['categoryStats'] = {};

  for (const answer of allAnswers) {
    const cat = answer.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, correct: 0, accuracy: 0 };
    }
    categoryStats[cat]!.total++;
    if (answer.isCorrect) {
      categoryStats[cat]!.correct++;
    }
  }

  // 正答率計算
  for (const cat of Object.keys(categoryStats) as DomainId[]) {
    const stats = categoryStats[cat]!;
    stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  }

  return {
    totalAnswers,
    correctAnswers,
    accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
    categoryStats
  };
}
