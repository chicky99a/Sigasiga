// Owner-approved Strict Decision Logic. The explicit 4–5 map takes precedence
// over the general 5/8 entry statement. No placement is inferred from total score.
export const levels = ['Pre-A0', 'A0', 'Early A1', 'Solid A1', 'Advanced A1', 'Solid A2', 'Early B1', 'Solid B1', 'Early B2', 'Solid B2'];
const sectionSizes = [8, 8, 8, 8, 4];
const sectionNames = ['A0', 'A1', 'A2', 'B1', 'B2'];
export function classify(counts) {
  if (!Array.isArray(counts) || counts.length !== sectionSizes.length || counts.some((n,i) => !Number.isInteger(n) || n < 0 || n > sectionSizes[i])) throw new Error('Invalid section scores.');
  const [a0,a1,a2,b1,b2] = counts;
  const special = counts.slice(0,4).every(n => n === 5);
  let rank;
  if (special) rank = 3;
  else if (a0 <= 4) rank = 0;
  else if (a0 < 6 || a1 <= 3) rank = 1;
  else if (a1 < 6) rank = 2;
  else if (a2 <= 3) rank = 3;
  else if (a2 < 6) rank = 4;
  else if (b1 <= 3) rank = 5;
  else if (b1 < 6) rank = 6;
  else if (b2 >= 4) rank = 9;
  else if (b2 >= 3) rank = 8;
  else rank = 7;
  const thresholds = [6, 6, 6, 6, 3];
  const firstUnstable = counts.findIndex((n,i) => n < thresholds[i]);
  const inconsistent = !special && firstUnstable >= 0 && counts.slice(firstUnstable + 1).some((n,offset) => {
    const sectionIndex = firstUnstable + 1 + offset;
    return n >= (sectionIndex === 4 ? 3 : 4);
  });
  return {
    level: levels[rank], rank, counts: [...counts], total: counts.reduce((a,b) => a+b, 0), inconsistent,
    note: inconsistent ? 'פרופיל לא עקבי - מומלץ לבדוק חשד לניחושים בחלקים המתקדמים' : '',
    breakdown: counts.map((n,i) => `${sectionNames[i]}: ${n}/${sectionSizes[i]}`).join(' | ') + ` (Total: ${counts.reduce((a,b) => a+b,0)}/36)`
  };
}
export function scoreAnswers(answers, key) {
  if (!Array.isArray(answers) || answers.length !== sectionSizes.reduce((a,b) => a+b,0) || !Array.isArray(key) || key.length !== answers.length || answers.some(a => a !== null && (!Number.isInteger(a) || a < 0 || a > 3))) throw new Error('Invalid test answers.');
  let offset = 0;
  return classify(sectionSizes.map(size => {
    const correct = answers.slice(offset,offset+size).filter((a,i) => a === key[offset+i]).length;
    offset += size;
    return correct;
  }));
}
