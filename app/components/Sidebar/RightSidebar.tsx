import React, { useState, useEffect } from 'react';
import type { EditorProps } from '@monaco-editor/react';

export default function RightSidebar() {
  const [code, setCode] = useState('');
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    import('@monaco-editor/react').then((module) => {
      setEditor(() => module.default);
    });

    fetch('/example/defaultCode.txt')
      .then((response) => response.text())
      .then((text) => setCode(text))
      .catch((error) => console.error('Error loading default code:', error));
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 min-h-0">
      <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Code Editor</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {isMounted && Editor ? (
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {code}
          </div>
        )}
      </div>
    </div>
  );
} 