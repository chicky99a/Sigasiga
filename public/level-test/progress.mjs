export const SKIPPED = -1;
export function skipStreak(answers, index) {
  let count=0;
  for(let i=index-1;i>=0 && answers[i]===SKIPPED;i--)count++;
  return count;
}
// Skipped and not-reached items earn zero; keep each section denominator at 8.
export function submissionAnswers(answers) {
  return answers.map(a => a===SKIPPED ? null : a);
}
