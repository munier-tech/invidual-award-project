import test from 'node:test';
import assert from 'node:assert/strict';

import { dedupeStudents, normalizeClassStudentIds } from '../utils/studentRoster.js';

test('dedupeStudents removes duplicate student records by _id', () => {
  const students = [
    { _id: 'a1', fullname: 'Student 1' },
    { _id: 'a1', fullname: 'Student 1 duplicate' },
    { _id: 'b2', fullname: 'Student 2' },
    { _id: 'c3', fullname: 'Student 3' },
  ];

  assert.deepEqual(dedupeStudents(students).map((student) => student._id), ['a1', 'b2', 'c3']);
});

test('normalizeClassStudentIds removes duplicate class membership references', () => {
  const ids = ['64a1', '64a1', '64b2', '64c3', '64b2'];

  assert.deepEqual(normalizeClassStudentIds(ids), ['64a1', '64b2', '64c3']);
});
