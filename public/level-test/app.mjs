import {questions} from './questions.mjs';
import {SKIPPED,skipStreak,submissionAnswers} from './progress.mjs';
import {submissionEndpoint} from './config.mjs';
const app=document.querySelector('#app');
const snailPath=document.createElement('div');
snailPath.className='snail-path';snailPath.setAttribute('aria-hidden','true');
snailPath.innerHTML='<div class="snail-travel"><img src="assets/snail.png" alt="" width="1536" height="1024"></div>';
app.before(snailPath);
let consecutiveSkips=0;
function moveSnail(advancing=false){
 snailPath.hidden=screen!=='question';
 if(screen!=='question')return;
 const travel=snailPath.querySelector('.snail-travel');
 travel.classList.toggle('moving',advancing);
 travel.style.left=`${(1-index/(questions.length-1))*100}%`;
 if(advancing && index%5===0 && !matchMedia('(prefers-reduced-motion: reduce)').matches){
   const image=travel.querySelector('img');
   image.getAnimations().forEach(a=>a.cancel());
   image.animate([{transform:'rotate(0deg)'},{transform:'rotate(-2deg)',offset:.55},{transform:'rotate(0deg)'}],{duration:1800,easing:'ease-in-out'});
 }
}
let index=0,answers=Array(questions.length).fill(null),screen='welcome',busy=false;
const welcomeText="After months of working from morning to night, Siga Siga's scientists have created the ultimate test for your Greek level. Take the test and make our snail happy. Haven't started yet? Well, siga siga.";
let typewriterTimer=null;
let contact={name:'',email:'',phone:''},submissionId=null,result=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function focusScreen(){document.querySelector('#focus-title')?.focus();window.scrollTo(0,0);}
function render(focus=true,advancing=false){
 if(typewriterTimer!==null){clearInterval(typewriterTimer);typewriterTimer=null;}
 moveSnail(advancing);
 if(screen==='welcome')renderWelcome();
 else if(screen==='contact')renderContact();
 else if(screen==='result')renderResult();
 else {
  const q=questions[index];
  app.innerHTML=`<div class="question-top"><p class="eyebrow" id="focus-title" tabindex="-1">QUESTION ${index+1} / ${questions.length}</p><p class="hint">Select one answer</p></div><form><fieldset aria-labelledby="question-text"><div class="question-text" id="question-text" lang="el">${escape(q.text)}</div><div class="answers">${q.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${answers[index]===i?'checked':''}><span class="letter" aria-hidden="true">${'ΑΒΓΔ'[i]}</span><span lang="el">${escape(o)}</span></label>`).join('')}</div></fieldset><div class="controls"><button type="button" class="back" id="back" ${index===0?'disabled':''}>← PREVIOUS</button><div class="forward-controls"><button type="button" class="skip" id="skip">SKIP →</button><button type="submit" class="lime" id="next" ${answers[index]===null||answers[index]===SKIPPED?'disabled':''}>${index===questions.length-1?'CONTINUE':'NEXT'} →</button></div></div><div class="early-finish" ${consecutiveSkips<3?'hidden':''}><p>These are getting difficult?</p><button type="button" id="finish">Finish the test here →</button></div></form>`;
  app.querySelector('form').onchange=e=>{answers[index]=Number(e.target.value);consecutiveSkips=0;app.querySelector('.early-finish').hidden=true;app.querySelector('#next').disabled=false;};
  app.querySelector('form').onsubmit=e=>{e.preventDefault();advance();};
  app.querySelector('#back').onclick=()=>{index--;consecutiveSkips=skipStreak(answers,index);render();};
  app.querySelector('#skip').onclick=()=>{answers[index]=SKIPPED;consecutiveSkips=skipStreak(answers,index+1);advance(true);};
  app.querySelector('#finish').onclick=()=>{if(consecutiveSkips<3)return;answers.fill(null,index);screen='contact';submissionId=null;render();};
 }
 if(focus)focusScreen();
}
function renderWelcome(){
 app.innerHTML='<section class="welcome-screen"><p class="eyebrow">GREEK LEVEL TEST</p><h1 id="focus-title" tabindex="-1" class="welcome-text" aria-label="'+escape(welcomeText)+'"><span id="typed-text" aria-hidden="true"></span><span class="typewriter-cursor" aria-hidden="true"></span></h1><button type="button" class="lime wide welcome-start" id="start" hidden>START →</button></section>';
 const typed=app.querySelector('#typed-text');
 const start=app.querySelector('#start');
 start.onclick=()=>{screen='question';render();};
 const finish=()=>{typed.textContent=welcomeText;start.hidden=false;typewriterTimer=null;};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
 let position=0;
 typewriterTimer=setInterval(()=>{
  position=Math.min(position+2,welcomeText.length);
  typed.textContent=welcomeText.slice(0,position);
  if(position===welcomeText.length){clearInterval(typewriterTimer);finish();}
 },35);
}
function advance(skipping=false){if(screen!=='question'||answers[index]===null||(!skipping&&answers[index]===SKIPPED))return;if(!skipping)consecutiveSkips=0;if(index===questions.length-1){screen='contact';submissionId=null;}else index++;render(true,true);}
function renderContact(){
 app.innerHTML=`<section class="contact-screen"><p class="eyebrow">YOUR GREEK LEVEL</p><h1 id="focus-title" tabindex="-1">WHERE SHOULD WE<br>SEND YOUR RESULT?</h1><p class="intro">Enter your details to get your Greek level result.</p><form id="contact"><div class="field"><label for="name">Name *</label><input id="name" name="name" autocomplete="name" maxlength="100" required value="${escape(contact.name)}"></div><div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required value="${escape(contact.email)}"></div><div class="field"><label for="phone">Phone <span>(optional)</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="40" value="${escape(contact.phone)}"></div><p class="form-error" id="form-error" role="alert"></p><div class="controls"><button type="button" class="back" id="back">← BACK</button><button type="submit" class="lime wide" id="submit">SEE MY RESULT →</button></div></form></section>`;
 app.querySelector('#contact').oninput=e=>{if(e.target.name)contact[e.target.name]=e.target.value;};
 app.querySelector('#back').onclick=()=>{screen='question';render();};
 app.querySelector('#contact').onsubmit=submit;
}
async function submit(e){
 e.preventDefault();if(busy)return;
 const form=e.currentTarget;
 if(!form.reportValidity())return;
 contact=Object.fromEntries(new FormData(form));
 contact.name=contact.name.trim();contact.email=contact.email.trim();contact.phone=contact.phone.trim();
 const error=app.querySelector('#form-error');
 if(!contact.name){error.textContent='Please enter your name.';return;}
 if(!submissionEndpoint){error.textContent='Result delivery is not connected yet. Your answers are still here; please keep this page open.';return;}
 busy=true;submissionId??=crypto.randomUUID();
 const controls=[...form.querySelectorAll('input,button')];controls.forEach(c=>c.disabled=true);
 const button=app.querySelector('#submit');button.textContent='SENDING…';error.textContent='';form.setAttribute('aria-busy','true');
 try{
  const response=await fetch(submissionEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({submissionId,...contact,answers:submissionAnswers(answers)}),signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Could not send your result. Please try again.');
  const data=await response.json();
  if(!data.ok)throw Error(data.error||'Could not send your result. Please try again.');
  if(!data.result?.level||!Array.isArray(data.result.counts))throw Error('Unexpected response. Please try again.');
  result=data.result;screen='result';render();
 }catch(err){error.textContent=err.name==='TimeoutError'?'This is taking longer than expected. Please try again; your answers are saved on this page.':err.message;controls.forEach(c=>c.disabled=false);button.textContent='SEE MY RESULT →';form.removeAttribute('aria-busy');}
 finally{busy=false;}
}
function renderResult(){
 app.innerHTML=`<section class="result-screen"><p class="eyebrow" id="focus-title" tabindex="-1">YOUR GREEK LEVEL</p><h1 class="level">${escape(result.level)}</h1><p class="intro">Your result has been sent to ${escape(contact.email)}.</p><p class="breakdown">${escape(result.breakdown)}</p>${result.inconsistent?'<p class="result-note">Your answers show an uneven pattern across levels. A teacher can help confirm your placement.</p>':''}<div class="controls"><button class="lime wide" id="restart">TAKE IT AGAIN →</button></div></section>`;
 app.querySelector('#restart').onclick=()=>{answers=Array(questions.length).fill(null);consecutiveSkips=0;index=0;screen='welcome';result=null;submissionId=null;contact={name:'',email:'',phone:''};render();};
}
render(false);
if(document.modelContext?.registerTool){
 const tool={name:'answer_current_question',description:'Select an answer for the current Greek level-test question and continue. Completing the questions opens the contact form; it does not submit personal details.',inputSchema:{type:'object',properties:{question:{type:'integer',minimum:1,maximum:32},answer:{type:'string',enum:['A','B','C','D']}},required:['question','answer'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(screen!=='question'||input.question!==index+1||!['A','B','C','D'].includes(input.answer))throw Error('Invalid answer or question is not current.');answers[index]='ABCD'.indexOf(input.answer);advance();return {questionsCompleted:screen==='contact',currentQuestion:screen==='question'?index+1:null};}};
 try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}
}
