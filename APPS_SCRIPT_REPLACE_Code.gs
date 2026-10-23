const ANSWER_KEY=[3,1,2,1,3,0,0,2,1,2,1,3,0,2,1,3,0,2,1,3,1,1,3,0,2,1,0,3,2,0,1,2];
const levels=['Pre-A0','A0','Early A1','Solid A1','Early A2','Solid A2','Early B1','Solid B1'];
function classify(counts){
if(!Array.isArray(counts)||counts.length!==4||counts.some(n=>!Number.isInteger(n)||n<0||n>8))throw new Error('Invalid section scores.');
const [a0,a1,a2,b1]=counts;const special=counts.every(n=>n===5);let rank;
if(special)rank=3;else if(a0<=4)rank=0;else if(a0<6||a1<=3)rank=1;else if(a1<6)rank=2;else if(a2<=3)rank=3;else if(a2<6)rank=4;else if(b1<=3)rank=5;else if(b1<6)rank=6;else rank=7;
const firstUnstable=counts.findIndex(n=>n<6);const inconsistent=!special&&firstUnstable>=0&&counts.slice(firstUnstable+1).some(n=>n>=4);
return {level:levels[rank],rank,counts:[...counts],total:counts.reduce((a,b)=>a+b,0),inconsistent,note:inconsistent?'פרופיל לא עקבי - מומלץ לבדוק חשד לניחושים בחלקים המתקדמים':'',breakdown:counts.map((n,i)=>['A0','A1','A2','B1'][i]+': '+n+'/8').join(' | ')+' (Total: '+counts.reduce((a,b)=>a+b,0)+'/32)'};
}
function scoreAnswers(answers,key){if(!Array.isArray(answers)||answers.length!==32||answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>3)))throw new Error('Complete all 32 questions first.');return classify([0,1,2,3].map(b=>answers.slice(b*8,b*8+8).filter((a,i)=>a===key[b*8+i]).length));}
const SPREADSHEET_ID='14b070BWmlt0YbCXf67v1AVZpMUGROaFlyBAsGHqloLo';
function doPost(e){const lock=LockService.getScriptLock();try{
if(!e||!e.postData||e.postData.contents.length>8000)throw new Error('Invalid submission.');
const data=JSON.parse(e.postData.contents);if(data.type==='contact-email-only')return handleContactEmailOnly_(data);if(data.type==='enrollment'&&data.formType==='contact')return handleContactEmailOnly_(data);if(data.type==='enrollment')return handleEnrollment_(data);const name=String(data.name||'').trim(),email=String(data.email||'').trim(),phone=String(data.phone||'').trim(),id=String(data.submissionId||'');
if(!name||name.length>100||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||phone.length>40||!/^[a-f0-9-]{36}$/i.test(id))throw new Error('Please check your name and email.');
const result=scoreAnswers(data.answers,ANSWER_KEY);const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([name,email,phone,data.answers])));
if(!lock.tryLock(20000))throw new Error('Please try again in a moment.');
const props=PropertiesService.getScriptProperties(),recordKey='submission:'+id;let record=JSON.parse(props.getProperty(recordKey)||'null');
if(record&&record.digest!==digest)throw new Error('This submission was already saved with different details. Please contact Siga Siga.');
if(record&&record.status==='sent')return jsonResponse({ok:true,result});
if(record&&record.status==='sending')throw new Error('Your result was saved. Email delivery needs checking; please contact Siga Siga before submitting again.');
if(MailApp.getRemainingDailyQuota()<1)throw new Error('Result delivery is temporarily unavailable. Please try again later.');
const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Leads');
if(!sheet)throw new Error('The Leads sheet is unavailable. Please contact Siga Siga.');
if(JSON.stringify(sheet.getRange(1,1,1,5).getValues()[0])!==JSON.stringify(['Date','Name','Email','Phone','Test Result']))throw new Error('The Leads sheet needs checking. Please contact Siga Siga.');
if(!record){const rowNumber=Math.max(sheet.getLastRow()+1,Number(props.getProperty('nextLeadRow')||2));props.setProperty('nextLeadRow',String(rowNumber+1));record={digest,row:rowNumber,status:'reserved'};props.setProperty(recordKey,JSON.stringify(record));}
if(record.status==='reserved'){const date=Utilities.formatDate(new Date(),'Europe/Athens','yyyy-MM-dd HH:mm:ss');sheet.getRange(record.row,1,1,5).setValues([[date,"'"+name,"'"+email,phone?"'"+phone:'',result.level]]);sheet.getRange(record.row,5).setNote(result.note);SpreadsheetApp.flush();record.status='saved';props.setProperty(recordKey,JSON.stringify(record));}
record.status='sending';props.setProperty(recordKey,JSON.stringify(record));
MailApp.sendEmail({to:email,subject:'Your Greek level result — Siga Siga',name:'Siga Siga',body:'Hi '+name+',\n\nYour Greek level result is: '+result.level+'.\n\n'+result.breakdown+'\n\n'+(result.inconsistent?'Your answers show an uneven pattern across levels. A teacher can help confirm your placement.\n\n':'')+'Thank you for taking the Siga Siga Greek level test.\n\nSiga Siga\nGreek Language & Culture Center'});
record.status='sent';props.setProperty(recordKey,JSON.stringify(record));return jsonResponse({ok:true,result});
}catch(error){const message=error.message||'';const safe=/^(Please |This submission |Your result |Result delivery |The Leads |Complete all |Invalid )/.test(message);return jsonResponse({ok:false,error:safe?message:'Could not finish sending your result. Please contact Siga Siga.'});}finally{if(lock.hasLock())lock.releaseLock();}}
function jsonResponse(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}

function handleEnrollment_(data){
const lock=LockService.getScriptLock();try{
const id=String(data.submissionId||'').trim(),courseId=String(data.courseId||'').trim(),name=String(data.fullName||'').trim(),email=String(data.email||'').trim().toLowerCase(),phone=String(data.phone||'').trim(),level=String(data.greekLevel||'').trim();
const isContact=data.formType==='contact',message=typeof data.message==='string'?data.message.trim():'';
const courses={'classic-greek':'LEARN GREEK','speak-freely':'SPEAK FREELY','drop-in':'DROP-IN'},course=isContact?'General enquiry':courses[courseId];
const levels=['Complete beginner','A0','A1','A2','B1','B1 or above','B2','C','Not sure'];
if(String(data.website||'').trim())return jsonResponse({ok:true,message:'Thank you — your request has been received.'});
if(!/^[a-f0-9-]{36}$/i.test(id)||!course||message.length>2000||!name||name.length>120||((!isContact||email)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||email.length>254||phone.length<6||phone.length>40||!/[0-9]/.test(phone)||!/^[+0-9().\s-]+$/.test(phone)||levels.indexOf(level)<0)throw new Error('Please check your course, name, email, phone number and Greek level.');
const subject=isContact?'New contact enquiry — Siga Siga':'New enrollment lead — '+course;
if(data.preview===true)return jsonResponse({ok:true,preview:true,message:'Preview only — no information was saved and no email was sent.',wouldWrite:{spreadsheet:'Alpha_OS_students_review_fixed',tab:'Leads',columns:['Date','Name','Email','Phone','Test Result','Course','Greek Level','Message'],values:['Timestamp (Europe/Athens)',name,email,phone,'',course,level,message]},wouldEmail:{to:'sigasigacenter@gmail.com',subject,message}});
if(!lock.tryLock(20000))throw new Error('Please try again in a moment.');
const props=PropertiesService.getScriptProperties(),recordKey='enrollment:'+id,digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(isContact||message?[courseId,name,email,phone,level,isContact,message]:[courseId,name,email,phone,level])));let record=JSON.parse(props.getProperty(recordKey)||'null');
if(record&&record.digest!==digest)throw new Error('This enrollment was already submitted with different details. Please contact Siga Siga.');
if(record&&record.status==='sent')return jsonResponse({ok:true,message:'Thank you — your request was saved and sent to Siga Siga.'});
if(record&&record.status==='sending')throw new Error('Your enrollment was saved, but email delivery needs checking. Please contact Siga Siga before submitting again.');
if(MailApp.getRemainingDailyQuota()<1)throw new Error('Enrollment email delivery is temporarily unavailable. Please try again later.');
const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Leads');if(!sheet)throw new Error('The Leads sheet is unavailable. Please contact Siga Siga.');
const headers=['Date','Name','Email','Phone','Test Result','Course','Greek Level'];if(JSON.stringify(sheet.getRange(1,1,1,7).getValues()[0])!==JSON.stringify(headers))throw new Error('The Leads sheet needs checking. Please contact Siga Siga.');
const messageHeader=sheet.getRange(1,8).getValue();if(messageHeader!==''&&messageHeader!=='Message')throw new Error('The Leads message column needs checking. Please contact Siga Siga.');
if(messageHeader===''){if(sheet.getLastRow()>1&&sheet.getRange(2,8,sheet.getLastRow()-1,1).getValues().some(row=>row[0]!==''))throw new Error('The Leads message column is not empty. Please contact Siga Siga.');sheet.getRange(1,8).setValue('Message');}
if(!record){const rowNumber=Math.max(sheet.getLastRow()+1,Number(props.getProperty('nextLeadRow')||2));props.setProperty('nextLeadRow',String(rowNumber+1));record={digest,row:rowNumber,status:'reserved'};props.setProperty(recordKey,JSON.stringify(record));}
if(record.status==='reserved'){const date=Utilities.formatDate(new Date(),'Europe/Athens','yyyy-MM-dd HH:mm:ss');sheet.getRange(record.row,1,1,8).setValues([[date,"'"+name,"'"+email,phone?"'"+phone:'','',course,level,message?"'"+message:'']]);SpreadsheetApp.flush();record.status='saved';props.setProperty(recordKey,JSON.stringify(record));}
record.status='sending';props.setProperty(recordKey,JSON.stringify(record));
MailApp.sendEmail({to:'sigasigacenter@gmail.com',subject,name:'Siga Siga Website',...(email?{replyTo:email}:{}),body:(isContact?'New contact enquiry':'New enrollment request')+' from the Siga Siga website.\n\n'+(isContact?'':'Course: '+course+'\n')+'Name: '+name+'\nEmail: '+email+'\nPhone: '+phone+'\nGreek level: '+level+'\n\nMessage:\n'+(message||'(No message)')});
record.status='sent';props.setProperty(recordKey,JSON.stringify(record));return jsonResponse({ok:true,message:'Thank you — your request was saved and sent to Siga Siga.'});
}catch(error){const message=error.message||'';const safe=/^(Please |This enrollment |Your enrollment |Enrollment email |The Leads )/.test(message);return jsonResponse({ok:false,error:safe?message:'Could not complete your enrollment request. Please contact Siga Siga.'});}finally{if(lock.hasLock())lock.releaseLock();}}

function previewContactFormUpdate(){
const base={preview:true,submissionId:"00000000-0000-4000-8000-000000000003",fullName:"Preview Only",email:"preview@example.invalid",phone:"+306900000000",greekLevel:"A1"};
const contact=JSON.parse(handleEnrollment_(Object.assign({},base,{formType:"contact",message:"Hello!\nPlease tell me about your classes."})).getContent());
const enrollment=JSON.parse(handleEnrollment_(Object.assign({},base,{courseId:"classic-greek"})).getContent());
const invalid=JSON.parse(handleEnrollment_(Object.assign({},base,{formType:"contact",message:"x".repeat(2001)})).getContent());
if(!contact.ok||!contact.preview||contact.wouldEmail.message!=="Hello!\nPlease tell me about your classes."||contact.wouldWrite.columns[7]!=="Message"||!enrollment.ok||invalid.ok)throw new Error("Preview checks failed");
console.log(JSON.stringify({passed:true,contact:contact,enrollment:enrollment,oversizeRejected:!invalid.ok}));
}

function previewOptionalContact(){
const base={preview:true,formType:"contact",submissionId:"00000000-0000-4000-8000-000000000005",fullName:"Preview Only",email:"",phone:"+306900000000",message:"Hello"};
["A0","B1","B2","C"].forEach(level=>{const r=JSON.parse(handleEnrollment_(Object.assign({},base,{greekLevel:level})).getContent());if(!r.ok||!r.preview||r.wouldWrite.values[2]!=="")throw new Error("Optional email preview failed: "+level);});
const bad=JSON.parse(handleEnrollment_(Object.assign({},base,{greekLevel:"A0",email:"invalid"})).getContent());if(bad.ok)throw new Error("Invalid email accepted");
console.log("PASS: optional email, A0/B1/B2/C, malformed email rejected. No writes or email sends.");
}


// CONTACT US ONLY: email delivery, no spreadsheet write.
function handleContactEmailOnly_(data) {
  const name=String(data.fullName||'').trim();
  const email=String(data.email||'').trim();
  const phone=String(data.phone||'').trim();
  const level=String(data.greekLevel||'').trim();
  const message=String(data.message||'').trim();
  const id=String(data.submissionId||'').trim();
  if(String(data.website||'').trim())return jsonResponse({ok:true,message:'Thank you! Your message has been sent.'});
  if(!/^[a-f0-9-]{36}$/i.test(id)||!name||name.length>120||
     (email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254))||
     !/^[+0-9().\s-]{6,40}$/.test(phone)||!/\d/.test(phone)||
     !['Complete beginner','A0','A1','A2','B1','B1 or above','B2','C','Not sure'].includes(level)||
     message.length>2000)
    return jsonResponse({ok:false,error:'Please check your name, email, phone number and Greek level.'});
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))return jsonResponse({ok:false,error:'Please try again in a moment.'});
  try {
    const props=PropertiesService.getScriptProperties();
    const key='contact-email-only:'+id;
    const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([name,email,phone,level,message])));
    const saved=JSON.parse(props.getProperty(key)||'null');
    if(saved&&saved.digest!==digest)return jsonResponse({ok:false,error:'This submission ID was already used with different details.'});
    if(saved&&saved.status==='sent')return jsonResponse({ok:true,message:'Thank you! Your message has been sent. We will get back to you soon.'});
    if(saved&&saved.status==='sending')return jsonResponse({ok:false,error:'Delivery status is uncertain. Please contact Siga Siga before submitting again.'});
    if(MailApp.getRemainingDailyQuota()<1)return jsonResponse({ok:false,error:'Email delivery is temporarily unavailable. Please try again later.'});
    props.setProperty(key,JSON.stringify({digest,status:'sending'}));
    MailApp.sendEmail({
      to:'sigasigacenter@gmail.com',
      subject:'New Contact Us message — Siga Siga',
      name:'Siga Siga Website',
      ...(email?{replyTo:email}:{}),
      body:'New Contact Us message from Siga Siga website\n\nName: '+name+
        '\nEmail: '+(email||'(not provided)')+
        '\nPhone: '+phone+'\nGreek level: '+level+
        '\n\nMessage:\n'+(message||'(No message)')
    });
    props.setProperty(key,JSON.stringify({digest,status:'sent'}));
    return jsonResponse({ok:true,message:'Thank you! Your message has been sent. We will get back to you soon.'});
  } catch(err) {
    return jsonResponse({ok:false,error:'Could not confirm email delivery. Please contact Siga Siga before submitting again.'});
  } finally {lock.releaseLock();}
}
