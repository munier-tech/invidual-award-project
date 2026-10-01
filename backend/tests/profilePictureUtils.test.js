import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldUploadProfilePicture } from '../utils/profilePictureUtils.js';

test('uploads only fresh data URLs and ignores placeholders and stored URLs', () => {
  assert.equal(shouldUploadProfilePicture('data:image/png;base64,abc123'), true);
  assert.equal(shouldUploadProfilePicture('https://res.cloudinary.com/demo/image/upload/x.jpg'), false);
  assert.equal(shouldUploadProfilePicture('lama keenin sawir'), false);
  assert.equal(shouldUploadProfilePicture(''), false);
  assert.equal(shouldUploadProfilePicture(null), false);
});
