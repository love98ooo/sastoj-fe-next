'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { loader } from '@monaco-editor/react';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })),
  {
    ssr: false,
    loading: () => (
      <div
        className="border border-border flex items-center justify-center bg-muted"
        style={{ height: '400px' }}
      >
        <span className="text-muted-foreground">Loading editor...</span>
      </div>
    ),
  }
);

export interface Language {
  value: string;
  label: string;
  monaco: string;
  template: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    value: 'C',
    label: 'C',
    monaco: 'c',
    template: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++',
    label: 'C++',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++98',
    label: 'C++98',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++11',
    label: 'C++11',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++11(O2)',
    label: 'C++11(O2)',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++14',
    label: 'C++14',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++14(O2)',
    label: 'C++14(O2)',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++17',
    label: 'C++17',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'C++17(O2)',
    label: 'C++17(O2)',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
  },
  {
    value: 'Bash',
    label: 'Bash',
    monaco: 'shell',
    template: `#!/bin/bash

# Write your solution here

`,
  },
  {
    value: 'NodeJS',
    label: 'NodeJS',
    monaco: 'javascript',
    template: `// Write your solution here

function main() {

}

main();`,
  },
  {
    value: 'Java',
    label: 'Java',
    monaco: 'java',
    template: `public class Main {
    public static void main(String[] args) {
        // Write your solution here

    }
}`,
  },
  {
    value: 'Golang',
    label: 'Golang',
    monaco: 'go',
    template: `package main

import "fmt"

func main() {
    // Write your solution here

}`,
  },
  {
    value: 'PHP',
    label: 'PHP',
    monaco: 'php',
    template: `<?php

// Write your solution here

?>`,
  },
  {
    value: 'Python3',
    label: 'Python3',
    monaco: 'python',
    template: `# Write your solution here

def main():
    pass

if __name__ == "__main__":
    main()`,
  },
  {
    value: 'Ruby',
    label: 'Ruby',
    monaco: 'ruby',
    template: `# Write your solution here

def main

end

main`,
  },
];

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string | number;
  readOnly?: boolean;
}

// Tokyo Night theme definition for Monaco Editor
const tokyoNightTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'bb9af7' },
    { token: 'operator', foreground: '89ddff' },
    { token: 'namespace', foreground: '89ddff' },
    { token: 'type', foreground: '0db9d7' },
    { token: 'struct', foreground: '0db9d7' },
    { token: 'class', foreground: '0db9d7' },
    { token: 'interface', foreground: '0db9d7' },
    { token: 'enum', foreground: '0db9d7' },
    { token: 'typeParameter', foreground: '0db9d7' },
    { token: 'function', foreground: '7aa2f7' },
    { token: 'method', foreground: '7aa2f7' },
    { token: 'macro', foreground: '7aa2f7' },
    { token: 'variable', foreground: 'c0caf5' },
    { token: 'parameter', foreground: 'e0af68' },
    { token: 'property', foreground: 'e0af68' },
    { token: 'label', foreground: 'bb9af7' },
    { token: 'constant', foreground: 'ff9e64' },
    { token: 'number', foreground: 'ff9e64' },
    { token: 'string', foreground: '9ece6a' },
    { token: 'character', foreground: '9ece6a' },
    { token: 'regexp', foreground: 'f7768e' },
    { token: 'delimiter', foreground: 'c0caf5' },
    { token: 'tag', foreground: 'f7768e' },
    { token: 'attribute.name', foreground: 'e0af68' },
    { token: 'attribute.value', foreground: '9ece6a' },
  ],
  colors: {
    'editor.background': '#1a1b26',
    'editor.foreground': '#c0caf5',
    'editor.lineHighlightBackground': '#24283b',
    'editor.selectionBackground': '#364A82',
    'editor.selectionHighlightBackground': '#364A82',
    'editorCursor.foreground': '#c0caf5',
    'editorWhitespace.foreground': '#565f89',
    'editorIndentGuide.background': '#363b54',
    'editorIndentGuide.activeBackground': '#565f89',
    'editorLineNumber.foreground': '#565f89',
    'editorLineNumber.activeForeground': '#c0caf5',
  },
};

// Tokyo Night Light theme definition for Monaco Editor
const tokyoNightLightTheme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '787c99', fontStyle: 'italic' },
    { token: 'keyword', foreground: '9854f1' },
    { token: 'operator', foreground: '007197' },
    { token: 'namespace', foreground: '007197' },
    { token: 'type', foreground: '0da0db' },
    { token: 'struct', foreground: '0da0db' },
    { token: 'class', foreground: '0da0db' },
    { token: 'interface', foreground: '0da0db' },
    { token: 'enum', foreground: '0da0db' },
    { token: 'typeParameter', foreground: '0da0db' },
    { token: 'function', foreground: '2e7de9' },
    { token: 'method', foreground: '2e7de9' },
    { token: 'macro', foreground: '2e7de9' },
    { token: 'variable', foreground: '4c505e' },
    { token: 'parameter', foreground: '8c6c3e' },
    { token: 'property', foreground: '8c6c3e' },
    { token: 'label', foreground: '9854f1' },
    { token: 'constant', foreground: 'b15c00' },
    { token: 'number', foreground: 'b15c00' },
    { token: 'string', foreground: '587539' },
    { token: 'character', foreground: '587539' },
    { token: 'regexp', foreground: 'f52a65' },
    { token: 'delimiter', foreground: '4c505e' },
    { token: 'tag', foreground: 'f52a65' },
    { token: 'attribute.name', foreground: '8c6c3e' },
    { token: 'attribute.value', foreground: '587539' },
  ],
  colors: {
    'editor.background': '#d5d6db',
    'editor.foreground': '#4c505e',
    'editor.lineHighlightBackground': '#e1e2e7',
    'editor.selectionBackground': '#b8c4e9',
    'editor.selectionHighlightBackground': '#b8c4e9',
    'editorCursor.foreground': '#4c505e',
    'editorWhitespace.foreground': '#787c99',
    'editorIndentGuide.background': '#c9cbd6',
    'editorIndentGuide.activeBackground': '#787c99',
    'editorLineNumber.foreground': '#787c99',
    'editorLineNumber.activeForeground': '#4c505e',
  },
};

export function CodeEditor({
  value,
  onChange,
  language,
  height = '100%',
  readOnly = false,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Define Tokyo Night themes when Monaco loads
  useEffect(() => {
    if (mounted) {
      loader.init().then(monaco => {
        monaco.editor.defineTheme('tokyo-night', tokyoNightTheme);
        monaco.editor.defineTheme('tokyo-night-light', tokyoNightLightTheme);
      });
    }
  }, [mounted]);

  const getMonacoLanguage = (lang: string) => {
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.value === lang);
    return langConfig?.monaco || 'cpp';
  };

  const getEditorTheme = () => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    return currentTheme === 'dark' ? 'tokyo-night' : 'tokyo-night-light';
  };

  if (!mounted) {
    return (
      <div
        className="border border-border flex items-center justify-center bg-muted"
        style={{ height }}
      >
        <span className="text-muted-foreground">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="border border-border overflow-hidden h-full">
      <MonacoEditor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        onChange={newValue => onChange(newValue || '')}
        theme={getEditorTheme()}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          suggest: {
            insertMode: 'replace',
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          contextmenu: true,
          mouseWheelZoom: true,
        }}
      />
    </div>
  );
}

export function getLanguageTemplate(language: string): string {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.value === language);
  return langConfig?.template || SUPPORTED_LANGUAGES[0].template;
}
