/**
 * Browser Text-to-Speech (Web Speech API — speechSynthesis).
 */

export function cancelTTS() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isTTSAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speaks text; cancels any in-flight utterance first.
 * @param {string} text
 * @param {{ onEnd?: () => void, lang?: string, rate?: number }} opts
 */
export function speak(text, opts = {}) {
  const { onEnd, lang = 'en-IN', rate = 1 } = opts;
  cancelTTS();

  const trimmed = String(text || '').trim();
  if (!trimmed) {
    queueMicrotask(() => onEnd?.());
    return;
  }

  if (!isTTSAvailable()) {
    queueMicrotask(() => onEnd?.());
    return;
  }

  const u = new SpeechSynthesisUtterance(trimmed);
  u.lang = lang;
  u.rate = rate;
  const done = () => onEnd?.();
  u.onend = done;
  u.onerror = done;

  window.speechSynthesis.speak(u);
}
