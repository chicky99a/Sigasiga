'use client';

import { useState } from 'react';
import { courses } from '../data/courses';
import CourseCard from './CourseCard';
import EnrollmentModal from './EnrollmentModal';

export default function CourseList({ levelTestUrl }) {
  const [expandedId, setExpandedId] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  return <div className="course-list">
    {courses.map(course => <CourseCard key={course.id} course={course}
      expanded={expandedId === course.id}
      onToggle={() => setExpandedId(id => id === course.id ? null : course.id)}
      onEnroll={() => setEnrolling(course)} />)}
    {enrolling && <EnrollmentModal course={enrolling} levelTestUrl={levelTestUrl} onClose={() => setEnrolling(null)} />}
  </div>;
}
