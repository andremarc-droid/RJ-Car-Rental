import { useEffect, useRef, useState } from 'react';
import {
  markChatRead,
  sendAdminMessage,
  subscribeChatMessages,
  subscribeChatThreads,
} from '../../services/chatReviews';
import type { ChatMessage, ChatThread } from '../../types';
import { formatTime } from '../../utils';

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeChatThreads(setThreads), []);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    markChatRead(selected.id);
    const unsub = subscribeChatMessages(selected.id, setMessages);
    return unsub;
  }, [selected]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!selected || !newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    await sendAdminMessage(selected.id, text);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl text-navy leading-tight">Live Support Chats</h2>

      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm h-[600px] flex">
        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Active Conversations</h3>
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
            {threads.length ? threads.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setSelected(chat)}
                className={`w-full text-left p-4 hover:bg-gray-100 transition-colors flex flex-col gap-1.5 ${selected?.id === chat.id ? 'bg-navy/5 border-l-4 border-accent' : ''}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-navy text-sm">{chat.userName}</span>
                  <span className="text-[10px] text-gray-500">{formatTime(chat.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-gray-400 truncate max-w-[80%]">{chat.lastMessage || 'No messages yet'}</span>
                  {(chat.unreadCount ?? 0) > 0 && selected?.id !== chat.id && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
              </button>
            )) : (
              <div className="p-8 text-center text-xs text-gray-400">No active support chats found.</div>
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between h-16 shrink-0">
            {selected ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-xs">
                  {selected.userName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-navy">{selected.userName}</h3>
                  <span className="text-[10px] text-gray-500">Customer Support Ticket</span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No session selected</span>
            )}
          </div>

          <div ref={containerRef} className="flex-grow p-5 overflow-y-auto space-y-4 bg-gray-50/50">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-sm">Select a customer from the left sidebar to start live chatting.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${msg.senderId === 'admin' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              ))
            )}
          </div>

          {selected && (
            <div className="p-4 border-t border-gray-200 bg-white flex gap-2 shrink-0">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                type="text"
                placeholder="Reply to customer..."
                className="flex-grow premium-input bg-gray-50 text-sm py-2 px-3"
              />
              <button type="button" onClick={handleSend} disabled={!newMessage.trim()} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shrink-0">
                <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
