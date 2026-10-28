/**
 * Small helper so every "save" action shows a loading toast while the record is
 * being formed, then hands over to the success/error toast that already exists.
 *
 * Rules it keeps:
 *  - every action gets its OWN toast id, so a loader can never replace another
 *    action's success/error toast (and vice versa);
 *  - the loader is always cleared before the existing toast fires;
 *  - it never throws, so adding it can't break an existing try/catch.
 */

/**
 * react-hot-toast flavour (default everywhere in this app).
 * `toast` is passed in so callers keep using their existing import.
 */
export const withSaveToast = async (toast, { id, loading, success, error }, fn) => {
  const tid = id || undefined;
  try {
    toast.loading(loading || 'Keydinaya...', tid ? { id: tid } : undefined);
  } catch {
    // A toast failure must never stop the save itself
  }

  try {
    const result = await fn();

    // Keep the spinner up only when the store explicitly reports failure
    const failed = result && typeof result === 'object' && result.success === false;
    if (failed && typeof error === 'function') {
      await Promise.resolve(error(result)).catch(() => {});
    } else if (success) {
      try {
        toast.success(typeof success === 'function' ? success(result) : success, tid ? { id: tid } : undefined);
      } catch {
        /* ignore */
      }
    }

    return result;
  } catch (err) {
    if (typeof error === 'function') {
      await Promise.resolve(error(err)).catch(() => {});
    } else {
      try {
        toast.error('Khalad ayaa dhacay');
      } catch {
        /* ignore */
      }
    }
    return { success: false, error: err?.message || String(err || ''), thrown: err };
  } finally {
    // The loading toast is replaced by the outcome above; this is a safety net
    // for paths that return without any toast.
    try {
      if (tid && typeof toast.dismiss === 'function') toast.dismiss(tid);
    } catch {
      /* ignore */
    }
  }
};

/**
 * react-toastify flavour. Note the API difference: there is no `id` option,
 * it is `{ toastId }`, and a success/error toast with the same `toastId`
 * replaces an existing loading toast of that id automatically.
 */
export const withNotifyToast = async (toast, { id, loading, success, error }, fn) => {
  const toastId = id || undefined;
  try {
    toast.loading(loading || 'Keydinaya...', { toastId });
  } catch {
    /* ignore */
  }

  try {
    const result = await fn();
    const failed = result && typeof result === 'object' && result.success === false;

    if (failed && typeof error === 'function') {
      await Promise.resolve(error(result)).catch(() => {});
    } else if (success) {
      try {
        toast.success(typeof success === 'function' ? success(result) : success, { toastId });
      } catch {
        /* ignore */
      }
    }
    return result;
  } catch (err) {
    if (typeof error === 'function') {
      await Promise.resolve(error(err)).catch(() => {});
    } else {
      try {
        toast.error('Khalad ayaa dhacay', { toastId });
      } catch {
        /* ignore */
      }
    }
    return { success: false, error: err?.message || String(err || ''), thrown: err };
  } finally {
    try {
      if (toastId && typeof toast.dismiss === 'function') toast.dismiss(toastId);
    } catch {
      /* ignore */
    }
  }
};
