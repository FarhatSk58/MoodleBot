import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Mic, MicOff, Video, VideoOff, Loader2, ArrowLeft, Radio, ShieldAlert, Volume2, Send, Bot, User } from 'lucide-react';
import { cancelTTS, speak, isTTSAvailable } from '../../utils/interviewVoice/tts';
import {
  createSpeechRecognition,
  isSpeechRecognitionAvailable,
  safeStartRecognition,
  safeStopRecognition,
} from '../../utils/interviewVoice/speechRecognition';
import { requestInterviewMedia, humanizeGetUserMediaError } from '../../utils/interviewVoice/userMedia';

const PHASE = {
  LOADING: 'LOADING',
  PRECHECK: 'PRECHECK',
  LIVE: 'LIVE',
  FETCHING_OPEN: 'FETCHING_OPEN',
  AI_THINKING: 'AI_THINKING',
  SUBMITTING_FEEDBACK: 'SUBMITTING_FEEDBACK',
};

/** @typedef {'pending' | 'granted' | 'denied'} PermState */

function PermBadge({ state }) {
  const map = {
    pending: 'bg-amber-50 text-amber-900 border-amber-200',
    granted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    denied: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  const label = state.charAt(0).toUpperCase() + state.slice(1);
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${map[state] || map.pending}`}>{label}</span>
  );
}

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.LOADING);
  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  /** @type {[PermState, function]} */
  const [micPerm, setMicPerm] = useState('pending');
  /** @type {[PermState, function]} */
  const [camPerm, setCamPerm] = useState('pending');
  /** @type {[PermState, function]} */
  const [audioOutPerm, setAudioOutPerm] = useState('pending');

  const [mediaError, setMediaError] = useState(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [sttListening, setSttListening] = useState(false);
  const [sttDraft, setSttDraft] = useState('');
  const [sttInterim, setSttInterim] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const shouldListenRef = useRef(false);
  const lastSpokenAiRef = useRef('');
  const pendingFeedbackAfterTtsRef = useRef(false);
  const sttRetryRef = useRef(0);
  const userDraftRef = useRef('');

  const stopMedia = useCallback(() => {
    safeStopRecognition(recognitionRef.current);
    recognitionRef.current = null;
    shouldListenRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const attachStream = useCallback((stream) => {
    streamRef.current = stream;
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    const play = () => el.play().catch(() => {});
    el.onloadedmetadata = play;
    play();
  }, []);

  const stopListeningInternal = useCallback(() => {
    shouldListenRef.current = false;
    safeStopRecognition(recognitionRef.current);
    recognitionRef.current = null;
    setSttListening(false);
    setSttInterim('');
  }, []);

  const requestPermissions = async () => {
    setMediaError(null);
    setMicPerm('pending');
    setCamPerm('pending');
    try {
      const stream = await requestInterviewMedia();
      setMicPerm('granted');
      setCamPerm('granted');
      attachStream(stream);
    } catch (err) {
      const msg = humanizeGetUserMediaError(err);
      setMediaError(msg);
      setMicPerm('denied');
      setCamPerm('denied');
      toast.error(msg);
    }
  };

  const testSpeakerOutput = useCallback(() => {
    if (!isTTSAvailable()) {
      toast.error('Text-to-speech is not available in this browser.');
      setAudioOutPerm('denied');
      return;
    }
    cancelTTS();
    speak('Audio check. You will hear the interviewer like this.', {
      onEnd: () => {
        setAudioOutPerm('granted');
        toast.success('Speaker check complete.');
      },
      lang: 'en-IN',
    });
  }, []);

  useEffect(() => {
    userDraftRef.current = sttDraft;
  }, [sttDraft]);

  const submitVoiceAnswerRef = useRef(null);
  const submittingAnswerRef = useRef(false);
  const micOnRef = useRef(micOn);
  const phaseRef = useRef(phase);
  const aiSpeakingRef = useRef(aiSpeaking);
  micOnRef.current = micOn;
  phaseRef.current = phase;
  aiSpeakingRef.current = aiSpeaking;

  const runFeedbackGeneration = useCallback(async () => {
    setPhase(PHASE.SUBMITTING_FEEDBACK);
    toast.loading('Generating your feedback…', { id: 'fb' });
    try {
      const fb = await api.post('/student/interviews/generate-feedback', {
        interviewId: id,
      });
      toast.success('Feedback ready!', { id: 'fb' });
      if (fb.data.success) navigate('/student/interviews');
      else throw new Error('Feedback failed');
    } catch (fbErr) {
      console.error(fbErr);
      toast.error('Could not generate feedback. You can retry from history.', { id: 'fb' });
      setPhase(PHASE.LIVE);
    }
  }, [id, navigate]);

  const startListeningAfterAiRef = useRef(() => {});

  const startListeningAfterAi = useCallback(() => {
    if (!micOnRef.current) return;
    if (phaseRef.current !== PHASE.LIVE) return;
    if (aiSpeakingRef.current) return;
    if (!isSpeechRecognitionAvailable()) {
      toast.error('Speech recognition is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    stopListeningInternal();
    shouldListenRef.current = true;
    setSttDraft('');
    setSttInterim('');
    userDraftRef.current = '';
    sttRetryRef.current = 0;

    const rec = createSpeechRecognition({
      lang: 'en-IN',
      onInterim: (interim) => {
        setSttInterim(interim);
      },
      onFinal: (final) => {
        setSttDraft((prev) => {
          const next = `${prev} ${final}`.trim();
          userDraftRef.current = next;
          return next;
        });
        setSttInterim('');
      },
      onError: (ev) => {
        if (ev.error === 'no-speech') {
          if (sttRetryRef.current < 6 && shouldListenRef.current && micOnRef.current) {
            sttRetryRef.current += 1;
            setTimeout(() => {
              if (shouldListenRef.current && recognitionRef.current) {
                safeStartRecognition(recognitionRef.current);
              }
            }, 400);
          }
          return;
        }
        if (ev.error === 'not-allowed') {
          toast.error('Microphone access denied for speech recognition.');
          setMicPerm('denied');
          stopListeningInternal();
          return;
        }
        if (ev.error !== 'aborted') {
          toast.error('Speech recognition error. Retrying…');
          if (shouldListenRef.current && micOnRef.current) {
            setTimeout(() => startListeningAfterAiRef.current(), 500);
          }
        }
      },
    });

    if (!rec) {
      toast.error('Could not start speech recognition.');
      return;
    }

    recognitionRef.current = rec;
    rec.onend = () => {
      if (
        shouldListenRef.current &&
        micOnRef.current &&
        phaseRef.current === PHASE.LIVE &&
        !aiSpeakingRef.current
      ) {
        try {
          safeStartRecognition(rec);
        } catch {
          /* ignore */
        }
      }
    };

    try {
      safeStartRecognition(rec);
      setSttListening(true);
    } catch {
      toast.error('Could not start listening.');
    }
  }, [stopListeningInternal]);

  startListeningAfterAiRef.current = startListeningAfterAi;

  const lastInterviewerLine = useMemo(() => {
    const arr = messages.filter((m) => m.role === 'interviewer');
    if (!arr.length) return '';
    return arr[arr.length - 1].content || '';
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    if (nearBottom || messages.length <= 2) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, phase]);

  const speakLatestAi = useCallback(
    (line) => {
      if (!line || line === lastSpokenAiRef.current) return;
      lastSpokenAiRef.current = line;
      stopListeningInternal();
      setAiSpeaking(true);
      aiSpeakingRef.current = true;
      cancelTTS();
      speak(line, {
        lang: 'en-IN',
        rate: 1,
        onEnd: () => {
          setAiSpeaking(false);
          aiSpeakingRef.current = false;
          if (pendingFeedbackAfterTtsRef.current) {
            pendingFeedbackAfterTtsRef.current = false;
            runFeedbackGeneration();
            return;
          }
          if (micOnRef.current && phaseRef.current === PHASE.LIVE) {
            queueMicrotask(() => startListeningAfterAiRef.current());
          }
        },
      });
    },
    [stopListeningInternal, runFeedbackGeneration]
  );

  useEffect(() => {
    if (phase !== PHASE.LIVE) return;
    if (!lastInterviewerLine) return;
    if (lastSpokenAiRef.current === lastInterviewerLine) return;
    speakLatestAi(lastInterviewerLine);
  }, [lastInterviewerLine, phase, speakLatestAi]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelTTS();
      stopListeningInternal();
      stopMedia();
    };
  }, [stopListeningInternal, stopMedia]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/student/interviews/${id}`);
        if (!res.data.success) throw new Error('Failed');
        const inv = res.data.data;
        if (inv.status === 'completed') {
          toast.error('This interview is already completed.');
          navigate('/student/interviews');
          return;
        }
        setInterview(inv);
        const secs = Number(inv.duration) * 60 || 1800;
        setTimeRemaining(secs);

        if (inv.status === 'in_progress' && Array.isArray(inv.messages) && inv.messages.length) {
          setMessages(inv.messages);
          lastSpokenAiRef.current = '';
          setPhase(PHASE.LIVE);
        } else {
          setPhase(PHASE.PRECHECK);
        }
      } catch {
        toast.error('Failed to load interview.');
        navigate('/student/interviews');
      }
    };
    load();
  }, [id, navigate]);

  const endingRef = useRef(false);

  const runEndInterview = useCallback(
    async ({ silent } = {}) => {
      if (endingRef.current) return;
      if (!silent && !window.confirm('End this interview now and generate feedback?')) return;
      endingRef.current = true;
      cancelTTS();
      stopListeningInternal();
      setPhase(PHASE.SUBMITTING_FEEDBACK);
      toast.loading('Finishing up…', { id: 'end' });
      try {
        const res = await api.post(`/student/interviews/${id}/end-early`);
        toast.success('Interview saved.', { id: 'end' });
        if (res.data.success) navigate('/student/interviews');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Could not end interview.', { id: 'end' });
        endingRef.current = false;
        setPhase(PHASE.LIVE);
      }
    },
    [id, navigate, stopListeningInternal]
  );

  const timerShouldRun = phase === PHASE.LIVE || phase === PHASE.AI_THINKING;

  useEffect(() => {
    if (!timerShouldRun) return undefined;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast('Time is up — wrapping up.', { icon: '⏱️' });
          runEndInterview({ silent: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerShouldRun, runEndInterview]);

  const toggleCamera = () => {
    const v = streamRef.current?.getVideoTracks?.()[0];
    if (v) {
      v.enabled = !v.enabled;
      setCamOn(v.enabled);
    } else {
      setCamOn((c) => !c);
    }
  };

  const toggleMicUi = () => {
    setMicOn((m) => {
      const next = !m;
      micOnRef.current = next;
      if (!next) {
        stopListeningInternal();
      } else if (phaseRef.current === PHASE.LIVE && !aiSpeakingRef.current) {
        queueMicrotask(() => startListeningAfterAiRef.current());
      }
      return next;
    });
  };

  const handleOpenSession = async () => {
    if (micPerm !== 'granted' || camPerm !== 'granted') {
      toast.error('Microphone and camera access are required.');
      return;
    }
    setPhase(PHASE.FETCHING_OPEN);
    try {
      const res = await api.post(`/student/interviews/${id}/open`);
      if (!res.data.success) throw new Error(res.data.message || 'Open failed');
      const payload = res.data.data;
      const msgs = payload.messages || [];
      lastSpokenAiRef.current = '';
      setMessages(msgs);
      setPhase(PHASE.LIVE);
      toast.success('Interview started.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not start interview.');
      setPhase(PHASE.PRECHECK);
    }
  };

  const submitVoiceAnswer = useCallback(
    async (text) => {
      if (submittingAnswerRef.current) return;
      submittingAnswerRef.current = true;
      stopListeningInternal();
      const trimmed = String(text || '').trim();
      if (!trimmed) {
        toast("We didn't hear an answer — sending so the interviewer can ask you to elaborate.");
      }
      setSttDraft('');
      setPhase(PHASE.AI_THINKING);
      try {
        const res = await api.post(`/student/interviews/${id}/turn`, {
          userText: trimmed,
        });
        if (!res.data.success) throw new Error(res.data.message || 'Turn failed');
        const { messages: nextMsgs, interviewComplete } = res.data.data;

        if (interviewComplete) {
          pendingFeedbackAfterTtsRef.current = true;
        }

        setMessages(nextMsgs || []);

        if (interviewComplete) {
          lastSpokenAiRef.current = '';
          setPhase(PHASE.LIVE);
        } else {
          setPhase(PHASE.LIVE);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Something went wrong.');
        setPhase(PHASE.LIVE);
        if (micOnRef.current) queueMicrotask(() => startListeningAfterAiRef.current());
      } finally {
        submittingAnswerRef.current = false;
      }
    },
    [id, stopListeningInternal]
  );

  submitVoiceAnswerRef.current = submitVoiceAnswer;

  useEffect(() => {
    if (phase !== PHASE.LIVE && phase !== PHASE.AI_THINKING) return;
    if (streamRef.current) return;
    (async () => {
      try {
        const stream = await requestInterviewMedia();
        setMicPerm('granted');
        setCamPerm('granted');
        attachStream(stream);
      } catch (err) {
        setMediaError(humanizeGetUserMediaError(err));
      }
    })();
  }, [phase, attachStream]);

  const handleEndEarly = () => runEndInterview({ silent: false });

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (phase === PHASE.LOADING) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  const precheck = phase === PHASE.PRECHECK || phase === PHASE.FETCHING_OPEN;
  const live = phase === PHASE.LIVE;
  const thinking = phase === PHASE.AI_THINKING;
  const finishing = phase === PHASE.SUBMITTING_FEEDBACK;

  const canStart = micPerm === 'granted' && camPerm === 'granted';
  const canSubmitNow = live && !thinking && !finishing && !aiSpeaking && !submittingAnswerRef.current;
  const studentSpeaking = live && sttListening && micOn && !aiSpeaking;

  const handleDraftSubmit = () => {
    submitVoiceAnswerRef.current?.(sttDraft);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] py-6 px-4 md:px-6">
      <main className="mx-auto w-full max-w-[1200px] rounded-2xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
        {precheck && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-lg w-full space-y-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={22} />
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Permissions required</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Allow microphone and camera for this session. Test speakers so you can hear the interviewer.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="font-semibold text-slate-800">Microphone</span>
                  <PermBadge state={micPerm} />
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="font-semibold text-slate-800">Camera</span>
                  <PermBadge state={camPerm} />
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="font-semibold text-slate-800">Audio output</span>
                  <PermBadge state={audioOutPerm} />
                </li>
              </ul>

              {mediaError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-sm p-3">{mediaError}</div>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <button
                  type="button"
                  onClick={requestPermissions}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                >
                  Request mic &amp; camera
                </button>
                <button
                  type="button"
                  onClick={testSpeakerOutput}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Volume2 size={18} /> Test speakers
                </button>
                <button
                  type="button"
                  onClick={handleOpenSession}
                  disabled={!canStart || phase === PHASE.FETCHING_OPEN}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:ml-auto"
                >
                  {phase === PHASE.FETCHING_OPEN ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Starting…
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Start stays disabled until microphone and camera show <strong>Granted</strong>. Use Test speakers to
                confirm audio output.
              </p>
            </div>
          </div>
        )}

        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/interviews')}
              className="text-slate-500 hover:text-slate-800 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-lg text-slate-900">{interview?.domain} Interview</h1>
              <p className="text-xs text-slate-500 font-semibold">1-on-1 live mock session</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
              <span className="font-mono text-lg text-slate-800 font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <button
              type="button"
              onClick={handleEndEarly}
              disabled={finishing || precheck}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 transition-colors text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              End Interview
            </button>
          </div>
        </header>

        {(live || thinking || finishing) && (
          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-5 min-h-[620px]">
              <section className="w-full lg:w-[65%] flex flex-col gap-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-indigo-700 font-semibold">Current Question</p>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                    {lastInterviewerLine || 'The interviewer question will appear here as the interview starts.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">AI Interviewer</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${thinking ? 'bg-amber-100 text-amber-700' : aiSpeaking ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                        {thinking ? 'Thinking' : aiSpeaking ? 'Speaking' : 'Listening'}
                      </span>
                    </div>
                    <div className="relative h-64 bg-gradient-to-br from-indigo-100 via-white to-sky-100 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-200 flex items-center justify-center text-indigo-600">
                        <Bot size={34} />
                      </div>
                      <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/85 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                        <Mic size={13} />
                        <Video size={13} />
                      </div>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">You</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${studentSpeaking ? 'bg-emerald-100 text-emerald-700' : micOn ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {studentSpeaking ? 'Listening' : micOn ? 'Ready' : 'Muted'}
                      </span>
                    </div>
                    <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${camPerm === 'granted' && camOn ? 'opacity-100' : 'opacity-45'}`}
                      />
                      {(camPerm !== 'granted' || !camOn) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 text-sm font-semibold gap-2 bg-slate-100/85">
                          <VideoOff size={30} />
                          {camPerm !== 'granted' ? 'Camera unavailable' : 'Camera off'}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                        {micOn ? <Mic size={13} /> : <MicOff size={13} />}
                        {camOn ? <Video size={13} /> : <VideoOff size={13} />}
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={toggleMicUi}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                          micOn ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100' : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                        aria-label="Toggle microphone"
                      >
                        {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                          camOn ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100' : 'border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        aria-label="Toggle camera"
                      >
                        {camOn ? <Video size={18} /> : <VideoOff size={18} />}
                      </button>
                    </div>
                  </article>
                </div>
              </section>

              <aside className="w-full lg:w-[35%] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[620px]">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-700">Interview Chat</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Live conversation</p>
              </div>
                <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#fbfcff]">
                  {messages.map((m, idx) => {
                    const aiMsg = m.role === 'interviewer';
                    return (
                      <div key={`chat-${idx}`} className={`flex ${aiMsg ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            aiMsg
                              ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                              : 'bg-indigo-100 text-indigo-900 rounded-tr-sm'
                          }`}
                        >
                          {m.content || <span className="opacity-70 italic">...</span>}
                        </div>
                      </div>
                    );
                  })}

                  {thinking && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-2 text-sm text-slate-500">
                        <Loader2 className="animate-spin" size={16} />
                        AI is typing...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <div className="border-t border-slate-200 bg-white p-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <textarea
                      id="voice-transcript"
                      value={sttDraft}
                      onChange={(e) => {
                        setSttDraft(e.target.value);
                        userDraftRef.current = e.target.value;
                      }}
                      rows={3}
                      placeholder={micOn ? 'Your spoken words appear here. Edit if needed, then submit.' : 'Unmute mic to start transcript.'}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleDraftSubmit();
                        }
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500 min-h-4">
                        {sttInterim ? <span className="text-indigo-700 font-semibold">Live: {sttInterim}</span> : 'Press Enter or Send to submit.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleDraftSubmit}
                        disabled={!canSubmitNow || !sttDraft.trim()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send size={14} />
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
