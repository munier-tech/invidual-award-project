export const normalizeClassStudentIds = (studentIds = []) => {
  if (!Array.isArray(studentIds)) return [];

  return [...new Set(studentIds.map((id) => String(id)))];
};

export const dedupeStudents = (students = []) => {
  if (!Array.isArray(students)) return [];

  const seen = new Set();

  return students.filter((student) => {
    const id = student?._id ? String(student._id) : student?.id ? String(student.id) : '';

    if (!id) return true;
    if (seen.has(id)) return false;

    seen.add(id);
    return true;
  });
};
