import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnswerInput({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported in this browser'); return; }
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN';
    let finalTranscript = text;
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setText(finalTranscript + interim);
    };
    r.onerror = () => { setRecording(false); toast.error('Microphone error'); };
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your answer here, or use the microphone to speak..."
          rows={5}
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-2">
        {/* Mic button */}
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
            recording
              ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {recording ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
        </button>
        {recording && <span className="text-xs text-red-500 font-medium">Recording...</span>}

        {/* Submit */}
        <button
          type="button"
          onClick={() => onSubmit(text)}
          disabled={loading || !text.trim()}
          className="ml-auto flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Evaluating...</> : <><Send size={14} /> Submit Answer</>}
        </button>
      </div>
    </div>
  );
}
