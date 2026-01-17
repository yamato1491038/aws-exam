// カテゴリ定義
export type DomainId = 'domain1' | 'domain2' | 'domain3' | 'domain4';

export interface Category {
  id: DomainId;
  name: string;
  weight: number;
}

export const CATEGORIES: Record<DomainId, Category> = {
  domain1: {
    id: 'domain1',
    name: '複雑な組織に対応するソリューションの設計',
    weight: 26
  },
  domain2: {
    id: 'domain2',
    name: '新しいソリューションのための設計',
    weight: 29
  },
  domain3: {
    id: 'domain3',
    name: '既存のソリューションの継続的な改善',
    weight: 25
  },
  domain4: {
    id: 'domain4',
    name: 'ワークロードの移行とモダナイゼーションの加速',
    weight: 20
  }
};

// 問題の型定義
export type QuestionType = 'single' | 'multiple';

export interface Question {
  questionId: string;
  question: string;
  questionType: QuestionType;
  choices: string[];
  correctAnswers: string[];
  explanation: string;
  category: DomainId;
}

// 回答の型定義
export interface Answer {
  PK: string;
  SK: string;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  choices: string[];
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  explanation: string;
  category: DomainId;
  createdAt: string;
}

// API リクエスト/レスポンス
export interface GenerateQuestionRequest {
  domainId: DomainId;
}

export interface SaveAnswerRequest {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  choices: string[];
  userAnswers: string[];
  correctAnswers: string[];
  explanation: string;
  category: DomainId;
}

export interface StatsResponse {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  categoryStats: {
    [key in DomainId]?: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
}

// JWT Claims from Cognito
export interface CognitoClaims {
  sub: string;
  email: string;
  'cognito:username': string;
}
