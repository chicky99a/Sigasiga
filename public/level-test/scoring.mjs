// Owner-approved Strict Decision Logic. The explicit 4–5 map takes precedence
// over the general 5/8 entry statement. No placement is inferred from total score.
export const levels = ['Pre-A0', 'A0', 'Early A1', 'Solid A1', 'Early A2', 'Solid A2', 'Early B1', 'Solid B1'];
export function classify(counts) {
  if (!Array.isArray(counts) || counts.length !== 4 || counts.some(n => !Number.isInteger(n) || n < 0 || n > 8)) throw new Error('Invalid section scores.');
  const [a0,a1,a2,b1] = counts;
  const special = counts.every(n => n === 5);
  let rank;
  if (special) rank = 3;
  else if (a0 <= 4) rank = 0;
  else if (a0 < 6 || a1 <= 3) rank = 1;
  else if (a1 < 6) rank = 2;
  else if (a2 <= 3) rank = 3;
  else if (a2 < 6) rank = 4;
  else if (b1 <= 3) rank = 5;
  else if (b1 < 6) rank = 6;
  else rank = 7;
  const firstUnstable = counts.findIndex(n => n < 6);
  const inconsistent = !special && firstUnstable >= 0 && counts.slice(firstUnstable + 1).some(n => n >= 4);
  return {
    level: levels[rank], rank, counts: [...counts], total: counts.reduce((a,b) => a+b, 0), inconsistent,
    note: inconsistent ? 'פרופיל לא עקבי - מומלץ לבדוק חשד לניחושים בחלקים המתקדמים' : '',
    breakdown: counts.map((n,i) => `${['A0','A1','A2','B1'][i]}: ${n}/8`).join(' | ') + ` (Total: ${counts.reduce((a,b) => a+b,0)}/32)`
  };
}
export function scoreAnswers(answers, key) {
  if (!Array.isArray(answers) || answers.length !== 32 || answers.some(a => a !== null && (!Number.isInteger(a) || a < 0 || a > 3))) throw new Error('Invalid test answers.');
  return classify([0,1,2,3].map(b => answers.slice(b*8,b*8+8).filter((a,i) => a === key[b*8+i]).length));
}
