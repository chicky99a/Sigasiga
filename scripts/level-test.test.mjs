import assert from 'node:assert/strict';
import {questions,key} from '../public/level-test/questions.mjs';
import {classify,scoreAnswers,levels} from '../public/level-test/scoring.mjs';
assert.equal(questions.length,32);
assert.deepEqual(['A0','A1','A2','B1'].map(b=>questions.filter(q=>q.band===b).length),[8,8,8,8]);
assert.equal(key.map(i=>'ABCD'[i]).join(''),'DBCBDAACBCBDACBDACBDBBDACBAD CABC'.replaceAll(' ',''));
const cases=[[[0,8,8,8],'Pre-A0'],[[4,8,8,8],'Pre-A0'],[[5,0,0,0],'A0'],[[5,4,2,1],'A0'],[[5,5,5,5],'Solid A1'],[[6,4,3,0],'Early A1'],[[6,5,8,8],'Early A1'],[[6,6,3,8],'Solid A1'],[[6,6,4,0],'Early A2'],[[6,6,5,8],'Early A2'],[[6,6,6,3],'Solid A2'],[[6,6,6,4],'Early B1'],[[6,6,6,5],'Early B1'],[[6,6,6,6],'Solid B1']];
for(const [counts,level] of cases)assert.equal(classify(counts).level,level,counts.join(','));
const covered=new Set();
for(let a=0;a<=8;a++)for(let b=0;b<=8;b++)for(let c=0;c<=8;c++)for(let d=0;d<=8;d++){
 const counts=[a,b,c,d],r=classify(counts);covered.add(r.level);
 assert.ok(levels.includes(r.level));assert.equal(r.total,a+b+c+d);
 if(counts.every(n=>n===5)){assert.equal(r.level,'Solid A1');assert.equal(r.inconsistent,false);continue;}
 if(r.rank>=2)assert.ok(a>=6);
 if(r.rank>=4)assert.ok(a>=6&&b>=6);
 if(r.rank>=6)assert.ok(a>=6&&b>=6&&c>=6);
 if(a<=4)assert.equal(r.rank,0);
}
assert.equal(covered.size,8);
assert.equal(classify([8,2,7,7]).inconsistent,true);
assert.equal(classify([8,8,2,1]).inconsistent,false);
assert.equal(scoreAnswers(key,key).level,'Solid B1');
assert.equal(scoreAnswers(key.map(k=>(k+1)%4),key).level,'Pre-A0');
assert.equal(scoreAnswers(Array(32).fill(null),key).level,'Pre-A0');
assert.throws(()=>scoreAnswers(Array(32).fill(-1),key));
assert.throws(()=>classify([9,0,0,0]));
console.log('All 6,561 score profiles, floor rules, thresholds, special case and exact answer key passed.');

const {SKIPPED,skipStreak,submissionAnswers}=await import('../public/level-test/progress.mjs');
assert.equal(skipStreak([SKIPPED,SKIPPED,SKIPPED,null],3),3);
assert.equal(skipStreak([SKIPPED,SKIPPED,0,null],3),0);
const partial=key.map((a,i)=>i<8?a:null);
assert.equal(scoreAnswers(partial,key).level,'A0');
assert.equal(scoreAnswers(submissionAnswers(Array(32).fill(SKIPPED)),key).total,0);
console.log('Skip and early-finish scoring retain fixed denominators and reset streaks after answers.');
