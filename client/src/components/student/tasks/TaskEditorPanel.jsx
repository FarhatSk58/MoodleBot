import Editor from '@monaco-editor/react';
import { cn } from '../../../lib/utils';

export default function TaskEditorPanel({ language, code, onChange, className }) {
  return (
    <div className={cn('flex flex-col min-h-0 rounded-lg overflow-hidden border border-slate-700 bg-[#1e1e1e]', className)}>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => onChange(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
