import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeClassStudentIds } from '../utils/studentRoster.js';

test('normalizeClassStudentIds removes duplicate student ids from class membership', () => {
  const ids = ['64a1f3a8a1b2c3d4e5f67890', '64a1f3a8a1b2c3d4e5f67891', '64a1f3a8a1b2c3d4e5f67890'];

  assert.deepEqual(normalizeClassStudentIds(ids), [
    '64a1f3a8a1b2c3d4e5f67890',
    '64a1f3a8a1b2c3d4e5f67891'
  ]);
});

test('normalizeClassStudentIds preserves a valid unique list', () => {
  const ids = ['64a1f3a8a1b2c3d4e5f67890', '64a1f3a8a1b2c3d4e5f67891'];

  assert.deepEqual(normalizeClassStudentIds(ids), ids);
});
