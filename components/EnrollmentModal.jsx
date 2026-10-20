'use client';

import { useEffect, useRef, useState } from 'react';
import { courses } from '../data/courses';
import { greekLevels } from '../data/enrollment';

export default function EnrollmentModal({ course, levelTestUrl, onClose }) {
  const dialog = useRef(null);
  const [level, setLevel] = useState('Complete beginner');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to check the form. Please try again.');
      setChecked(true);
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message || 'Unable to check the form. Please try again.');
    } finally { setBusy(false); }
  }

  return <dialog ref={dialog} className="enrollment-modal" aria-labelledby="enrollment-title" aria-describedby="enrollment-note" onClose={onClose}>
    <div className="enrollment-heading">
      <h3 id="enrollment-title">ENROLL</h3>
      <button type="button" onClick={() => dialog.current.close()} aria-label="Close enrollment form">CLOSE ×</button>
    </div>
    <p id="enrollment-note">Preview only. Enrollment is not connected yet; your details will not be saved or sent to the school.</p>
    {!checked && <form onSubmit={submit}>
      <label htmlFor="enrollment-course">Course</label>
      <select id="enrollment-course" name="courseId" defaultValue={course.id} required>
        {courses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <label htmlFor="enrollment-name">Full name (required)</label>
      <input id="enrollment-name" name="fullName" autoComplete="name" required maxLength={120} />
      <label htmlFor="enrollment-email">Email (required)</label>
      <input id="enrollment-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <label htmlFor="enrollment-phone">Phone number (required)</label>
      <input id="enrollment-phone" name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40} />
      <label htmlFor="enrollment-level">Greek level</label>
      <select id="enrollment-level" name="greekLevel" value={level} onChange={event => setLevel(event.target.value)}>
        {greekLevels.map(item => <option key={item}>{item}</option>)}
      </select>
      {level === 'Not sure' && <p className="level-test-help">{levelTestUrl
        ? <a href={levelTestUrl} target="_blank" rel="noopener noreferrer">Take our Greek level test (optional) ↗</a>
        : 'You can enroll without knowing your level. The optional Greek level test link will be available here once configured.'}</p>}
      <button className="lime-button" type="submit" disabled={busy}>{busy ? 'CHECKING…' : 'SUBMIT →'}</button>
    </form>}
    <p role="status" aria-live="polite" className="enrollment-status">{message}</p>
  </dialog>;
}
