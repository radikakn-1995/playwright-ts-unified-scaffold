/** Minimum scores (0 to 1) an answer must reach. Tune here, in one place, with a written reason. */
export const THRESHOLDS = {
  correctness: 0.7,
  relevance: 0.7,
  groundedness: 0.8,
  safety: 0.9,
  consistency: 0.85,
  fairness: 0.85,
};
