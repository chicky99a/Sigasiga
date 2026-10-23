import { courses } from '../../../data/courses.js';
import { enrollmentScriptEndpoint, enrollmentNotificationEmail } from '../../../data/integrations.js';
import { greekLevels } from '../../../data/enrollment.js';

const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = value => /^[+0-9().\s-]{6,40}$/.test(value) && /\d/.test(value);
const validId = value => /^[a-f0-9-]{36}$/i.test(value);

export async function POST(request) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const expectedOrigin = process.env.ENROLLMENT_SITE_ORIGIN || `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
  if (origin !== expectedOrigin) return reply({ ok: false, message: 'This form must be submitted from this website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({ ok: false, message: 'Expected a JSON form submission.' }, 415);
  }

  let values;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ ok: false, message: 'Please complete the form.' }, 400);
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return reply({ ok: false, message: 'The form is too large.' }, 413); }
      chunks.push(value);
    }
    values = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return reply({ ok: false, message: 'Invalid form submission.' }, 400);
  }

  const field = key => typeof values?.[key] === 'string' ? values[key].trim() : '';
  const isContact = field('formType') === 'contact';
  const enrollment = {
    formType: isContact ? 'contact' : 'enrollment',
    submissionId: field('submissionId'),
    courseId: field('courseId'),
    fullName: field('fullName'),
    email: field('email').toLowerCase(),
    phone: field('phone'),
    greekLevel: field('greekLevel'),
    website: field('website'),
    message: field('message'),
  };
  if (!validId(enrollment.submissionId)
    || (!isContact && !courses.some(course => course.id === enrollment.courseId))
    || enrollment.message.length > 2000
    || !enrollment.fullName || enrollment.fullName.length > 120
    || enrollment.email.length > 254 || ((!isContact || enrollment.email) && !validEmail(enrollment.email))
    || !validPhone(enrollment.phone)
    || !greekLevels.includes(enrollment.greekLevel)) {
    return reply({ ok: false, message: 'Please check your course, name, email, phone number and Greek level.' }, 400);
  }

  // A filled honeypot is treated like a successful submission but is not forwarded.
  if (enrollment.website) return reply({ ok: true, message: 'Thank you — your request has been received.' });

  const courseName = isContact ? 'General enquiry' : courses.find(course => course.id === enrollment.courseId).name;
  const emailSubject = isContact ? 'New contact enquiry — Siga Siga' : `New enrollment lead — ${courseName}`;
  if (values.preview === true && process.env.NODE_ENV !== 'production') {
    return reply({
      ok: true,
      preview: true,
      message: 'Preview only — no information was saved and no email was sent.',
      wouldWrite: {
        spreadsheet: 'Alpha_OS_students_review_fixed',
        tab: 'Leads',
        columns: ['Date', 'Name', 'Email', 'Phone', 'Test Result', 'Course', 'Greek Level', 'Message'],
        values: ['Timestamp (Europe/Athens)', enrollment.fullName, enrollment.email, enrollment.phone, '', courseName, enrollment.greekLevel, enrollment.message],
      },
      wouldEmail: { to: enrollmentNotificationEmail, subject: emailSubject, message: enrollment.message },
    });
  }

  try {
    const upstream = await fetch(enrollmentScriptEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type: 'enrollment', ...enrollment }),
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    });
    const body = await upstream.text();
    let result;
    try { result = JSON.parse(body); } catch { throw new Error('Unexpected response from the enrollment processor.'); }
    if (!upstream.ok || !result?.ok) {
      return reply({ ok: false, message: result?.error || 'We could not confirm delivery. Please contact Siga Siga.' }, 502);
    }
    return reply({ ok: true, message: result.message || 'Thank you! Your message has been sent. We will get back to you soon.' });
  } catch {
    return reply({ ok: false, message: 'We could not confirm that your request was completed. Please contact Siga Siga before submitting again.' }, 502);
  }
}
