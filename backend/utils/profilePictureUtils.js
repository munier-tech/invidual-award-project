export const shouldUploadProfilePicture = (value) => {
  if (typeof value !== 'string') return false;

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === 'lama keenin sawir') {
    return false;
  }

  return trimmedValue.startsWith('data:image/') || trimmedValue.startsWith('blob:');
};
