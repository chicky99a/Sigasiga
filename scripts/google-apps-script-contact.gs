// Add this handling to the EXISTING Apps Script deployment, preserving its level-test doPost logic.
// This is an integration helper, not a replacement for the entire existing script.
const CONTACT_SHEET_NAME = 'Leads';
const CONTACT_EMAIL = 'sigasigacenter@gmail.com';
const CONTACT_HEADERS = ['Date','Name','Email','Phone','Test Result','Course','Greek Level','Message'];

function handleContactEnrollment_(payload, spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);
  if (!sheet) throw new Error('Leads sheet not found');
  const id = String(payload.submissionId || '');
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Invalid submission ID');
  const props = PropertiesService.getScriptProperties();
  const key = 'contact-' + id;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (props.getProperty(key)) return {ok:true, message:'Thank you! We have received your message and will get back to you soon.'};
    const header = sheet.getRange(1,1,1,Math.max(sheet.getLastColumn(),8)).getValues()[0];
    CONTACT_HEADERS.forEach((name, index) => {
      if (header[index] !== name) sheet.getRange(1,index+1).setValue(name);
    });
    const values = [new Date(), String(payload.fullName||''), String(payload.email||''), String(payload.phone||''), '', payload.formType === 'contact' ? 'General enquiry' : String(payload.courseId||''), String(payload.greekLevel||''), String(payload.message||'')];
    sheet.appendRow(values.map(v => typeof v === 'string' && /^[=+@\-]/.test(v) ? "'"+v : v));
    props.setProperty(key, 'saved');
    MailApp.sendEmail({to:CONTACT_EMAIL, subject:'New Siga Siga enquiry — '+values[1], body:CONTACT_HEADERS.map((h,i)=>h+': '+values[i]).join('\n')});
    props.setProperty(key, 'emailed');
    return {ok:true, message:'Thank you! We have received your message and will get back to you soon.'};
  } finally {lock.releaseLock();}
}
