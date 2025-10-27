import React from 'react'
import Card from './Card.jsx'
import ChatBubble from './ChatBubble.jsx'

export default function ChatPanel({ messages, onSend }) {
  const [draft, setDraft] = React.useState('')
  const endRef = React.useRef(null)
  React.useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages.length])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (draft.trim()) {
        onSend(draft.trim())
        setDraft('')
      }
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
        <div className="size-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-neutral-300">Assistant is ready</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-neutral-400">
            Try: <span className="italic">"EDA of sales, temperature"</span>,
            <span className="italic"> "Forecast of demand"</span>,
            <span className="italic"> "Correlation for price, rating, volume"</span>
          </div>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} text={m.text} />
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-neutral-800">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            placeholder="Describe the analysis you want..."
            className="flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={() => { if (!draft.trim()) return; onSend(draft.trim()); setDraft('') }}
            className="self-end rounded-xl bg-cyan-500 px-4 py-2 font-medium hover:bg-cyan-400"
          >
            Send
          </button>
        </div>
      </div>
    </Card>
  )
}
