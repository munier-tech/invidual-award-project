import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeDate } from '../controllers/dailyQuranController.js';

test('normalizeDate keeps the selected calendar date in local time', () => {
  const value = normalizeDate('2026-10-06');

  assert.equal(value.getFullYear(), 2026);
  assert.equal(value.getMonth(), 9);
  assert.equal(value.getDate(), 6);
  assert.equal(value.getHours(), 0);
  assert.equal(value.getMinutes(), 0);
  assert.equal(value.getSeconds(), 0);
});

test('normalizeDate preserves date boundaries for next-day queries', () => {
  const start = normalizeDate('2026-10-06');
  const nextDay = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);

  assert.equal(nextDay.getFullYear(), 2026);
  assert.equal(nextDay.getMonth(), 9);
  assert.equal(nextDay.getDate(), 7);
});
