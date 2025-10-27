import React from 'react'
import ChatPanel from '../components/ChatPanel.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'
import { parseAnalyticsFromMessage } from '../lib/parseIntent.js'
import { api } from '../lib/api.js'

/**
 * Workspace state + side effects
 * - Loads conversation history from backend on mount/project switch
 * - Persists each message to backend conversations API
 * - Derives analytics items from user prompts (local-only)
 */
function useWorkspace(projectId) {
  const [messages, setMessages] = React.useState([]) // [{id, role, text, ts}]
  const [analyticsItems, setAnalyticsItems] = React.useState([]) // local "cards"

  // Load conversation history for the project
  React.useEffect(() => {
    let isActive = true
    const load = async () => {
      if (!projectId) return
      try {
        const list = await api.listConversations({
          project_id: projectId,
          sort_asc: true,
          limit: 500,
        })
        if (!isActive) return
        const msgs = list.map(c => ({
          id: c.id,
          role: c.role,
          text: typeof c.message?.text === 'string' ? c.message.text : JSON.stringify(c.message),
          ts: new Date(c.timestamp).getTime(),
        }))
        setMessages(msgs)
      } catch (e) {
        console.error('Failed to load conversations:', e)
        setMessages([]) // fail soft
      }
    }
    load()
    return () => { isActive = false }
  }, [projectId])

  // Send a user message -> persist -> add assistant reply -> persist
  const sendMessage = async (text) => {
    const userLocal = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userLocal])

    // Persist user message
    try {
      await api.createConversation({ project_id: projectId, role: 'user', message: { text } })
    } catch (e) {
      console.error('Saving user message failed:', e)
    }

    // Create analytics items (local) based on intent parsing
    const parsed = parseAnalyticsFromMessage(text)
    if (parsed.length) setAnalyticsItems(prev => [...parsed, ...prev])

    const assistantText = parsed.length
      ? `Got it. I created ${parsed.length} analytics ${parsed.length > 1 ? 'items' : 'item'}. You can refine them or run analyses on the right.`
      : `Tell me what you want to analyze (e.g., "EDA of sales and temperature", "Forecast of demand", "Correlation for A,B,C").`

    const botLocal = { id: crypto.randomUUID(), role: 'assistant', text: assistantText, ts: Date.now() + 1 }
    setMessages(prev => [...prev, botLocal])

    // Persist assistant message
    try {
      await api.createConversation({ project_id: projectId, role: 'assistant', message: { text: assistantText } })
    } catch (e) {
      console.error('Saving assistant message failed:', e)
    }
  }

  const clearAnalytics = () => setAnalyticsItems([])

  return { messages, analyticsItems, setAnalyticsItems, sendMessage, clearAnalytics }
}

/**
 * Workspace page
 * - Auto-splits into two columns when analytics exist
 */
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
          <button
            onClick={clearAnalytics}
            className="text-sm px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700"
          >
            Clear analytics
          </button>
        </div>
      </div>

      {/* Chat-only until we have analytics; then split chat (left) + analytics (right) */}
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