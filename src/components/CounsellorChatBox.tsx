import React, { useState } from 'react';
import { Send, User, Sparkles, MessageSquare } from 'lucide-react';
import { Crest } from './Crest.tsx';

interface ChatMessageItem {
  id: string;
  sender: 'student' | 'counsellor';
  text: string;
  timestamp: string;
}

interface CounsellorChatBoxProps {
  universityName?: string;
  universitySlug?: string;
  threadId?: string;
  onThreadUpdate?: (newThreadId: string) => void;
}

export const CounsellorChatBox: React.FC<CounsellorChatBoxProps> = ({
  universityName,
  universitySlug,
  threadId,
  onThreadUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'init',
      sender: 'counsellor',
      text: universityName
        ? `Greetings, scholar. I am at your disposal to illuminate any further particulars regarding ${universityName}—from departmental prerequisites and post-UTME screening nuances to hostel accommodations and bursaries.`
        : 'Greetings, scholar. What queries may I clarify regarding your university prospects, UTME score alignment, or course choices?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isSending) return;

    const userMessage: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      sender: 'student',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/counsellor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          threadId,
          universitySlug,
          context: universityName ? `Regarding ${universityName}` : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        if (data.threadId && onThreadUpdate) {
          onThreadUpdate(data.threadId);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'counsellor',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'The counsellor was unable to respond.');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'counsellor',
          text: `A momentary dispatch interruption occurred: ${(err as Error).message}. Please reiterate your query.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = universityName
    ? [
        `What is the typical Post-UTME screening format at ${universityName}?`,
        `Are first-year undergraduate hostels compulsory here?`,
        `Can I combine WAEC and NECO results?`,
      ]
    : [
        'How does the JAMB CAPS admission process operate?',
        'Can I study Medicine without Further Mathematics?',
        'Which Federal universities have the lowest fee schedules?',
      ];

  return (
    <div className="bg-[#FBF7EC] border border-[#D5C7AA] p-4 sm:p-5 flex flex-col h-[420px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E3D9C6] mb-3">
        <div className="flex items-center gap-2.5">
          <Crest size="sm" />
          <div>
            <h4 className="font-heading text-sm font-bold text-[#1F3D2B]">
              Ask the Counsellor
            </h4>
            <p className="font-serif text-[11px] text-[#8A8576]">
              Persistent Advisory Session {threadId ? `(Ref #${threadId.slice(-6)})` : ''}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-serif uppercase tracking-wider text-[#A98A4F] border border-[#A98A4F]/40 px-2 py-0.5">
          Live Counsel
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-serif">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'student' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] p-3 leading-relaxed ${
                m.sender === 'student'
                  ? 'bg-[#1F3D2B] text-[#F5EFE0] border border-[#162C1F]'
                  : 'bg-[#F5EFE0] text-[#1B2432] border border-[#D5C7AA]'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
            </div>
            <span className="text-[10px] text-[#8A8576] mt-0.5 px-1">{m.timestamp}</span>
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs font-serif text-[#8A8576] italic">
            <span className="w-2 h-2 rounded-full bg-[#A98A4F] animate-ping" />
            <span>The Counsellor is reviewing university archives...</span>
          </div>
        )}
      </div>

      {/* Suggested Inquiries */}
      <div className="pt-2 pb-2">
        <div className="flex flex-wrap gap-1">
          {sampleQuestions.slice(0, 2).map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInput(q);
              }}
              className="text-[10px] font-serif text-[#1F3D2B] bg-[#F5EFE0] hover:bg-[#EAE2D0] border border-[#D5C7AA] px-2 py-0.5 truncate max-w-full text-left"
            >
              &ldquo;{q}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#E3D9C6]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Present your inquiry to the counsellor..."
          className="flex-1 bg-[#F5EFE0] border border-[#D5C7AA] px-3 py-2 text-xs font-serif text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-4 py-2 bg-[#1F3D2B] hover:bg-[#162C1F] disabled:opacity-50 text-[#F5EFE0] text-xs font-serif flex items-center gap-1 cursor-pointer"
        >
          <Send className="w-3 h-3 text-[#A98A4F]" />
          <span>Dispatch</span>
        </button>
      </form>
    </div>
  );
};
