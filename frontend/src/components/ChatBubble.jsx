import React from 'react'
export default function ChatBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow ${isUser ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-100'}`}>
        {text}
      </div>
    </div>
  )
}
