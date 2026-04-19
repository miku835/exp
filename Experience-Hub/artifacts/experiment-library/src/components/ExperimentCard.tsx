import React from "react";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "./CodeBlock";
import { Experiment } from "@workspace/api-client-react";

interface ExperimentCardProps {
  experiment: Experiment;
  keywords?: string[];
}

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length) return <>{text}</>;

  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        keywords.some((kw) => part.toLowerCase() === kw.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-primary/25 text-primary font-medium rounded-sm px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function ExperimentCard({ experiment, keywords = [] }: ExperimentCardProps) {
  const isImageOutput = experiment.output?.match(/\.(jpeg|jpg|gif|png)$/i);

  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-start justify-between mb-3 gap-4">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              <HighlightedText text={experiment.title} keywords={keywords} />
            </h3>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 font-mono text-xs flex-shrink-0"
            >
              {experiment.subject}
            </Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <HighlightedText text={experiment.description} keywords={keywords} />
          </p>
        </div>

        <div>
          <CodeBlock code={experiment.code} language={experiment.language} keywords={keywords} />
        </div>

        {experiment.output && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground/80 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/80"></span>
              Output
            </h4>
            <div className="bg-black/20 rounded-lg p-4 border border-border/30">
              {isImageOutput ? (
                <img
                  src={`/api/outputs/${experiment.output}`}
                  alt={`Output for ${experiment.title}`}
                  className="max-w-full h-auto rounded-md border border-border/20 shadow-sm"
                  loading="lazy"
                />
              ) : (
                <pre className="text-sm font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {experiment.output}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
