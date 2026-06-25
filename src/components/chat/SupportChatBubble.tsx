import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendCustomerMessage, subscribeChatMessages } from '../../services/chatReviews';
import { formatTime } from '../../utils';

export default function SupportChatBubble() {
  const { user, isAdmin, displayName } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; text: string; createdAt?: unknown }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unread, setUnread] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!user || isAdmin) return;
    const unsubscribe = subscribeChatMessages(user.uid, (msgs) => {
      setMessages(msgs);
      if (!initialLoad.current && !open) setUnread(true);
      initialLoad.current = false;
    });
    return unsubscribe;
  }, [user, isAdmin, open]);

  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (isAdmin) return null;

  if (!user) {
    return (
      <div className="fixed bottom-5 right-20 z-[9998]">
        <Link to="/login" className="h-12 px-5 bg-accent hover:bg-accent-dark text-white rounded-full flex items-center justify-center shadow-lg text-sm font-bold gap-2">
          Sign in to chat
        </Link>
      </div>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    const text = newMessage.trim();
    setNewMessage('');
    await sendCustomerMessage(user.uid, displayName, text);
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    setUnread(false);
  };

  return (
    <div className="fixed bottom-5 right-20 z-[9998] flex flex-col items-end">
      {open && (
        <div className="bg-gray-900 border border-gray-800 w-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4">
          <div className="bg-navy p-4 flex items-center justify-between border-b border-gray-850">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">Live Support</h4>
                <span className="text-[10px] text-gray-300">Typically replies instantly</span>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={containerRef} className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-950/20">
            <div className="text-center py-6">
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Welcome to RJ Car Rental support! Feel free to ask any questions about your bookings or available vehicles.
              </p>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.senderId === user.uid
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="break-words leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-850 bg-gray-900/90 flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text"
              placeholder="Type a message..."
              className="flex-grow premium-input bg-gray-950 border-gray-800 text-gray-200 text-sm py-2 px-3 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-2.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white rounded-xl font-bold transition-all shrink-0"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="h-12 w-12 bg-accent hover:bg-accent-dark text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 relative"
      >
        {unread && !open && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[9px] font-black text-white">!</div>
        )}
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </div>
  );
}
