'use client';

import { useEffect, useRef } from 'react';
import EnrollmentForm from './EnrollmentForm';

export default function EnrollmentModal({ course, levelTestUrl, onClose }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <dialog ref={dialog} className="enrollment-modal" aria-labelledby="enrollment-title" onClose={onClose}>
    <div className="enrollment-heading">
      <h3 id="enrollment-title">ENROLL</h3>
      <button type="button" onClick={() => dialog.current.close()} aria-label="Close enrollment form">CLOSE ×</button>
    </div>
    <EnrollmentForm initialCourseId={course.id} levelTestUrl={levelTestUrl} />
  </dialog>;
}
