"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-stone prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: (p) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-sand-200 bg-white">
              <table className="my-0 w-full" {...p} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
