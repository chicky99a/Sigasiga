'use client';

export default function CourseCard({ course, expanded, onToggle, onEnroll }) {
  const detailsId = `${course.id}-details`;

  return <article className="course-card">
    <div className="course-row">
    <div><h3>{course.name}</h3><p>{course.details}</p></div>
    <strong>€{course.price}</strong>
    <button type="button" aria-expanded={expanded} aria-controls={detailsId}
      aria-label={`${expanded ? 'Less' : 'More'} about ${course.name.toLowerCase()}`}
      onClick={onToggle}>{expanded ? 'LESS' : 'MORE'} →</button>
    </div>
    <div id={detailsId} className="course-details" hidden={!expanded}>
      {course.expanded.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <button className="lime-button enroll-button" type="button" onClick={onEnroll}>ENROLL →</button>
    </div>
  </article>;
}
