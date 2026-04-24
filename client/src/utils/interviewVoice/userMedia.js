/**
 * getUserMedia helpers for camera + mic preview.
 */

export async function requestInterviewMedia(constraints = {}) {
  const defaultConstraints = {
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: true,
    ...constraints,
  };

  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error('Media devices are not supported in this browser.');
    err.code = 'NOT_SUPPORTED';
    throw err;
  }

  try {
    return await navigator.mediaDevices.getUserMedia(defaultConstraints);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (e && typeof e === 'object' && 'name' in e) {
      err.name = e.name;
    }
    throw err;
  }
}

export function humanizeGetUserMediaError(err) {
  const name = err?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Access was denied. Check browser site settings and click Retry.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera or microphone was found.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Camera or mic is in use by another app. Close other apps and retry.';
  }
  if (name === 'OverconstrainedError') {
    return 'Your device does not support the requested video settings.';
  }
  return err?.message || 'Could not access camera or microphone.';
}
