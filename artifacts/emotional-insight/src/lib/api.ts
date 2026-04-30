// Centralized API helpers. Re-export generated types so pages don't import deep paths.
export { useAnalyzeReflection } from "@workspace/api-client-react";
export type {
  AnalyzeRequest as AnalyzeRequestType,
  AnalyzeResponse as AnalyzeReflectionResponseType,
  NextStep,
  InsightWhy,
} from "@workspace/api-client-react";
