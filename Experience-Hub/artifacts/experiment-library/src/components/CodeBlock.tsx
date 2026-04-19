import React, { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

interface CodeBlockProps {
  code: string;
  language: string;
  keywords?: string[];
}

export function CodeBlock({ code, language, keywords = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    try {
      const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
      let result = hljs.highlight(code, { language: validLanguage }).value;

      if (keywords.length > 0) {
        const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
        result = result.replace(pattern, (match) =>
          `<mark class="code-highlight">${match}</mark>`
        );
      }

      setHighlightedCode(result);
    } catch {
      setHighlightedCode(code);
    }
  }, [code, language, keywords]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/40 bg-[#0d0d12]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-border/40">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <pre className="!m-0 !p-0">
          <code
            className={`hljs language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode || code }}
          />
        </pre>
      </div>
    </div>
  );
}
