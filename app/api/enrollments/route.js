import { courses } from '../../../data/courses.js';
import { greekLevels } from '../../../data/enrollment.js';

const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const expectedOrigin = process.env.ENROLLMENT_SITE_ORIGIN || `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
  if (origin !== expectedOrigin) {
    return reply({ message: 'This form must be submitted from this website.' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({ message: 'Expected a JSON form submission.' }, 415);
  }
  let values;
  try {
    // Bound the body before parsing; never log or persist personal details.
    const reader = request.body?.getReader();
    if (!reader) return reply({ message: 'Please complete the form.' }, 400);
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return reply({ message: 'Form submission is too large.' }, 413); }
      chunks.push(value);
    }
    values = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return reply({ message: 'Invalid form submission.' }, 400); }

  const field = key => typeof values?.[key] === 'string' ? values[key].trim() : '';
  const enrollment = {
    courseId: field('courseId'), fullName: field('fullName'), email: field('email'),
    phone: field('phone'), greekLevel: field('greekLevel'),
  };
  if (!courses.some(course => course.id === enrollment.courseId)
    || !enrollment.fullName || enrollment.fullName.length > 120
    || enrollment.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollment.email)
    || !/^[+0-9().\s-]{6,40}$/.test(enrollment.phone) || !/\d/.test(enrollment.phone)
    || !greekLevels.includes(enrollment.greekLevel)) {
    return reply({ message: 'Please check the course, name, email, phone number and Greek level.' }, 400);
  }

  // Integration boundary: add the Google Sheets adapter here only after approval.
  // Keep credentials in server-only environment variables, escape spreadsheet
  // formulas, and implement idempotency/rate limiting before accepting live leads.
  // Return a saved confirmation only after a verified successful write.
  return reply({ status: 'preview', saved: false,
    message: 'Your form was checked successfully. This is a preview only — no enrollment has been sent or saved.' });
}
