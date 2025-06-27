// Page component prop types

export interface ContestProblemPageProps {
  params: Promise<{
    contestId: string;
    problemId: string;
  }>;
}

export interface ContestProblemsPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export interface ContestPageProps {
  params: Promise<{
    contestId: string;
  }>;
}