/**
 * Browser SpeechRecognition wrapper (user speech → text).
 */

export function isSpeechRecognitionAvailable() {
  return (
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

/**
 * @param {{
 *   lang?: string,
 *   onInterim?: (text: string) => void,
 *   onFinal?: (text: string) => void,
 *   onError?: (ev: SpeechRecognitionErrorEvent) => void,
 * }} handlers
 * @returns {SpeechRecognition | null}
 */
export function createSpeechRecognition(handlers = {}) {
  const { lang = 'en-IN', onInterim, onFinal, onError } = handlers;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = lang;
  r.maxAlternatives = 3;

  r.onresult = (event) => {
    // Full interim across ALL non-final hypotheses — required for visible live captions.
    // (Iterating only from resultIndex often yields empty interim while the user is still talking.)
    let allInterim = '';
    for (let i = 0; i < event.results.length; i += 1) {
      if (!event.results[i].isFinal) {
        allInterim += event.results[i][0].transcript;
      }
    }
    // Newly finalized segments only (avoid double-counting committed text).
    let newFinals = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        newFinals += event.results[i][0].transcript;
      }
    }
    if (newFinals) onFinal?.(newFinals);
    onInterim?.(allInterim);
  };

  r.onerror = (ev) => {
    onError?.(ev);
  };

  return r;
}

export function safeStartRecognition(rec) {
  if (!rec) return;
  try {
    rec.start();
  } catch {
    /* already started */
  }
}

export function safeStopRecognition(rec) {
  if (!rec) return;
  try {
    rec.stop();
  } catch {
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
  }
}
