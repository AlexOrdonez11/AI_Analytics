import React from 'react'
import ChatPanel from '../components/ChatPanel.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'
import DatasetsPanel from '../components/DatasetsPanel.jsx'
import { parseAnalyticsFromMessage } from '../lib/parseIntent.js'
import { api } from '../lib/api.js'

function useWorkspace(projectId) {
  const [messages, setMessages] = React.useState([])
  const [analyticsItems, setAnalyticsItems] = React.useState([])

  React.useEffect(() => {
    let active = true
    const load = async () => {
      if (!projectId) return
      try {
        const list = await api.listConversations({ project_id: projectId, sort_asc: true, limit: 500 })
        if (!active) return
        const msgs = list.map(c => ({
          id: c.id,
          role: c.role,
          text: typeof c.message?.text === 'string' ? c.message.text : JSON.stringify(c.message),
          ts: new Date(c.timestamp).getTime(),
        }))
        setMessages(msgs)
      } catch (e) {
        console.error('Failed to load conversations:', e)
        setMessages([])
      }
    }
    load()
    return () => { active = false }
  }, [projectId])

  const sendMessage = async (text) => {
    const userLocal = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userLocal])

    // persist user message (optional; you likely already do this)
    try { await api.createConversation({ project_id: projectId, role: 'user', message: { text } }) } catch {}

    // call analyst agent
    let reply = "I'm having trouble analyzing right now."
    try {
      const out = await api.analystChat({ project_id: projectId, message: text })
      reply = out.reply
    } catch (e) {
      console.error(e)
    }

    const botLocal = { id: crypto.randomUUID(), role: 'assistant', text: reply, ts: Date.now() + 1 }
    setMessages(prev => [...prev, botLocal])

    // persist assistant message (optional; for unified history)
    try { await api.createConversation({ project_id: projectId, role: 'assistant', message: { text: reply } }) } catch {}
  }

  const clearAnalytics = () => setAnalyticsItems([])
  return { messages, analyticsItems, setAnalyticsItems, sendMessage, clearAnalytics }
}

export default function Workspace({ projectId, projectName }) {
  const { messages, analyticsItems, setAnalyticsItems, sendMessage, clearAnalytics } = useWorkspace(projectId)
  const split = analyticsItems.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">{projectName || 'Workspace'}</h2>
          <p className="text-sm text-neutral-400">{projectName ? 'Chat‑driven analytics' : `Project: ${projectId}`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAnalytics} className="text-sm px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700">
            Clear analytics
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${split ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="min-h-[65vh]">
          {split && <AnalyticsPanel items={analyticsItems} setItems={setAnalyticsItems} />}
          <DatasetsPanel projectId={projectId} />
        </div>
        <div className="min-h-[65vh] ">
          <ChatPanel messages={messages} onSend={sendMessage} />
        </div>
      </div>
    </div>
  )
}