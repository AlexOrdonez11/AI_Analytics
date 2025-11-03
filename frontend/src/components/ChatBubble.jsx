import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatForMarkdown } from "../lib/formatMarkdown.js";

export default function ChatBubble({ role, text }) {
  const isUser = role === "user";
  const content = isUser ? text : formatForMarkdown(text);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow",
          isUser
            ? "bg-cyan-500 text-neutral-950"
            : // Tailwind Typography for beautiful Markdown:
              "bg-neutral-800 text-neutral-100 prose prose-sm prose-invert " +
              "prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-hr:my-3 " +
              "prose-headings:mt-3 prose-headings:mb-2 prose-strong:font-semibold"
        ].join(" ")}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            // Enable tables, lists, strikethrough, autolinks, etc.
            remarkPlugins={[remarkGfm]}
            // Tweak elements for extra spacing/structure
            components={{
              ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-sm font-semibold" {...props} />,
              table: ({node, ...props}) => (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" {...props} />
                </div>
              ),
              th: ({node, ...props}) => (
                <th className="border-b border-neutral-700 pb-1 pr-4 text-left text-neutral-300" {...props} />
              ),
              td: ({node, ...props}) => (
                <td className="border-b border-neutral-800 py-1 pr-4 align-top" {...props} />
              ),
              code: ({inline, ...props}) =>
                inline ? (
                  <code className="px-1 py-0.5 rounded bg-neutral-700/70" {...props} />
                ) : (
                  <code className="block p-3 rounded bg-neutral-900 border border-neutral-800 overflow-auto" {...props} />
                ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}