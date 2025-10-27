import React from 'react'
import ChatPanel from '../components/ChatPanel.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'
import { storage } from '../lib/storage.js'
import { parseAnalyticsFromMessage } from '../lib/parseIntent.js'

function useWorkspace(projectId) {
  const chatKey = `app:chat:${projectId}`
  const analyticsKey = `app:analytics:${projectId}`
  const [messages, setMessages] = React.useState(() => storage.get(chatKey, []))
  const [analyticsItems, setAnalyticsItems] = React.useState(() => storage.get(analyticsKey, []))

  React.useEffect(() => storage.set(chatKey, messages), [chatKey, messages])
  React.useEffect(() => storage.set(analyticsKey, analyticsItems), [analyticsKey, analyticsItems])

  const sendMessage = (text) => {
    const msg = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() }
    const parsed = parseAnalyticsFromMessage(text)
    const assistantText = parsed.length
      ? `Got it. I created ${parsed.length} analytics ${parsed.length > 1 ? 'items' : 'item'}. You can refine them or run analyses on the right.`
      : `Tell me what you want to analyze (e.g., "EDA of sales and temperature", "Forecast of demand", "Correlation for A,B,C").`
    const bot = { id: crypto.randomUUID(), role: 'assistant', text: assistantText, ts: Date.now() + 1 }
    setMessages((prev) => [...prev, msg, bot])
    if (parsed.length) setAnalyticsItems((prev) => [...parsed, ...prev])
  }

  const clearAnalytics = () => setAnalyticsItems([])
  return { messages, analyticsItems, setAnalyticsItems, sendMessage, clearAnalytics }
}

export default function Workspace({ projectId }) {
  const { messages, analyticsItems, setAnalyticsItems, sendMessage, clearAnalytics } = useWorkspace(projectId)
  const split = analyticsItems.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">Workspace</h2>
          <p className="text-sm text-neutral-400">Project: {projectId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAnalytics} className="text-sm px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700">Clear analytics</button>
        </div>
      </div>
      <div className={`grid gap-4 ${split ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="min-h-[65vh]">
          <ChatPanel messages={messages} onSend={sendMessage} />
        </div>
        {split && (
          <div className="min-h-[65vh]">
            <AnalyticsPanel items={analyticsItems} setItems={setAnalyticsItems} />
          </div>
        )}
      </div>
    </div>
  )
}
