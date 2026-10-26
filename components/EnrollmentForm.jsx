'use client';

import { useRef, useState } from 'react';
import { greekLevels } from '../data/enrollment';

export default function EnrollmentForm({ initialCourseId = '', levelTestUrl = '/level-test/index.html', contact = false }) {
  const [level, setLevel] = useState('Complete beginner');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const submissionId = useRef(null);

  async function submit(event) {
    event.preventDefault();
    if (busy || submitted) return;
    setBusy(true);
    setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    submissionId.current ||= crypto.randomUUID();
    values.submissionId = submissionId.current;

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'We could not confirm your request. Please try again.');
      setSubmitted(true);
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message || 'We could not confirm your request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function resetId() {
    if (!busy) submissionId.current = null;
  }

  return <>
    {!submitted && <form className="enrollment-form" onSubmit={submit} onInput={resetId}>
      {contact ? <input type="hidden" name="formType" value="contact" /> : <input type="hidden" name="courseId" value={initialCourseId} />}
      <label htmlFor="enrollment-name">Full name</label>
      <input id="enrollment-name" name="fullName" autoComplete="name" required maxLength={120} />
      <label htmlFor="enrollment-email">Email{contact ? ' (optional)' : ''}</label>
      <input id="enrollment-email" name="email" type="email" autoComplete="email" required={!contact} maxLength={254} />
      <label htmlFor="enrollment-phone">Phone number</label>
      <input id="enrollment-phone" name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40} />
      <label htmlFor="enrollment-level">Greek level</label>
      <select id="enrollment-level" name="greekLevel" value={level} onChange={event => { setLevel(event.target.value); resetId(); }}>
        {greekLevels.map(item => <option key={item}>{item}</option>)}
      </select>
      {level === 'Not sure' && <p className="level-test-help"><a href={levelTestUrl} target="_blank" rel="noopener noreferrer">Take our Greek level test (optional) ↗</a></p>}
      {contact && <>
        <label htmlFor="enrollment-message">Message (optional)</label>
        <textarea id="enrollment-message" name="message" rows={5} maxLength={2000} />
      </>}
      <div className="enrollment-honeypot" aria-hidden="true">
        <label htmlFor="enrollment-website">Leave this field empty</label>
        <input id="enrollment-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="lime-button" type="submit" disabled={busy}>{busy ? 'SENDING…' : 'SUBMIT →'}</button>
      {contact && <p className="enrollment-contact-alternative"><strong>Too lazy to fill out the form?</strong> Give us a call, send us a <a href="https://wa.me/306981279627" target="_blank" rel="noopener noreferrer">WhatsApp</a> / Viber at <a href="tel:+306981279627">+30 698 127 9627</a>, or drop us an <a href="mailto:sigasigacenter@gmail.com">email</a> at <a href="mailto:sigasigacenter@gmail.com">sigasigacenter@gmail.com</a>.</p>}
    </form>}
    <p role="status" aria-live="polite" className="enrollment-status">{message}</p>
  </>;
}
