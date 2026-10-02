import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Loader2, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { toolDefinitions, executeTool } from '../../services/chatTools';

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
const MODEL = 'google/gemini-2.0-flash-001';
const MAX_TOOL_ROUNDS = 10;

interface DisplayMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
}

type ApiMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls: ApiToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

interface ApiToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

function buildSystemPrompt(lang: 'en' | 'fr'): string {
  return lang === 'fr'
    ? `Tu es FitBot, un coach fitness autonome intégré dans FitTrack. Tu as accès à des outils pour lire et modifier les données de l'utilisateur.

COMPORTEMENT CRITIQUE — AGIS, NE DEMANDE PAS:
- NEVER ask "would you like me to…?" or "shall I…?" — just DO it
- Si l'utilisateur dit "log 200g chicken for lunch" → appelle search_food puis log_meal immédiatement, sans demander confirmation
- Si l'utilisateur dit "update my weight to 80kg" → appelle update_user_profile immédiatement
- Si l'utilisateur demande un plan nutrition → récupère son profil, cherche les aliments disponibles, log TOUS les repas toi-même, puis résume ce que tu as fait
- Si l'utilisateur demande un plan d'entraînement → cherche les exercices et construis le plan sans demander de précisions
- Quand des détails manquent (quantité, type de repas, etc.), fais un CHOIX RAISONNABLE basé sur le contexte au lieu de demander
- Tu peux appeler PLUSIEURS outils en une seule réponse — fais-le autant que possible
- Après avoir agi, donne un RÉSUMÉ COURT de ce qui a été fait (2-3 phrases max, markdown avec gras et listes)`
    : `You are FitBot, an autonomous fitness coach built into FitTrack. You have tools to read and modify the user's data.

CRITICAL BEHAVIOR — ACT, DON'T ASK:
- NEVER ask "would you like me to…?", "shall I…?", or "do you want me to…?" — just DO it
- If the user says "log 200g chicken for lunch" → call search_food then log_meal immediately, no confirmation needed
- If the user says "update my weight to 80kg" → call update_user_profile immediately
- If the user asks for a nutrition/diet plan → fetch their profile, search available foods, log ALL the meals yourself, then summarize what you did
- If the user asks for a workout plan → search exercises and build the plan without asking for clarifications
- When details are missing (quantity, meal type, etc.), make a REASONABLE DEFAULT CHOICE based on context instead of asking
- You can call MULTIPLE tools in a single response — do so whenever possible
- After acting, give a SHORT SUMMARY of what was done (2-3 sentences max, markdown with bold and lists)`;
}

async function callApi(messages: ApiMessage[]): Promise<any> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: toolDefinitions,
    }),
  });
  return res.json().catch(() => ({ error: { message: "Invalid JSON response" } }));
}

// ── Markdown rendering ──────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={elements.length} className="my-1.5 p-2 rounded-lg bg-black/20 text-xs overflow-x-auto font-mono">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (line.match(/^#{1,3}\s/)) {
      const content = line.replace(/^#{1,3}\s+/, '');
      elements.push(<p key={elements.length} className="font-bold mt-1">{inlineMarkdown(content)}</p>);
      i++;
      continue;
    }

    if (line.match(/^\s*[-*]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s/)) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={elements.length} className="list-disc list-inside my-1 space-y-0.5">
          {items.map((item, j) => <li key={j}>{inlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (line.match(/^\s*\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s/)) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={elements.length} className="list-decimal list-inside my-1 space-y-0.5">
          {items.map((item, j) => <li key={j}>{inlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    if (line.trim() === '') {
      elements.push(<br key={elements.length} />);
      i++;
      continue;
    }

    elements.push(<p key={elements.length} className="my-0.5">{inlineMarkdown(line)}</p>);
    i++;
  }

  return elements;
}

function inlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={parts.length}>{match[2]}</strong>);
    else if (match[4]) parts.push(<em key={parts.length}>{match[4]}</em>);
    else if (match[6]) parts.push(<code key={parts.length} className="px-1 py-0.5 rounded bg-black/20 text-xs font-mono">{match[6]}</code>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MarkdownContent({ text }: { text: string }) {
  const rendered = useMemo(() => renderMarkdown(text), [text]);
  return <>{rendered}</>;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ChatBubble() {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayMessages, loading, toolStatus]);

  if (!OPENROUTER_KEY || !isAuthenticated || !user) return null;
  const lang = language as 'en' | 'fr';

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);
    setToolStatus(null);

    const userMsg: ApiMessage = { role: 'user', content: text };
    const systemMsg: ApiMessage = { role: 'system', content: buildSystemPrompt(lang) };

    const newHistory: ApiMessage[] = [...apiHistory, userMsg];
    setApiHistory(newHistory);
    setDisplayMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const response = await callApi([systemMsg, ...newHistory]);
      if (response.error) {
          const isRateLimit = response.error.code === 429 || response.error.message?.includes('429');
          const isTimeout = response.error.code === 504 || response.error.message?.includes('504');
          
          let errorMsg = lang === 'fr' ? 'Erreur de connexion.' : 'Connection error.';
          if (isRateLimit) errorMsg = lang === 'fr' ? 'Limite de requêtes atteinte. Réessayez plus tard.' : 'Rate limit reached. Try again later.';
          if (isTimeout) errorMsg = lang === 'fr' ? 'Le serveur met trop de temps à répondre.' : 'Server is taking too long to respond.';

          setDisplayMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
          return;
      }
      await agentLoop([systemMsg, ...newHistory], newHistory);
    } catch (err) {
      setDisplayMessages(prev => [
        ...prev,
        { role: 'assistant', content: lang === 'fr' ? 'Erreur de connexion.' : 'Connection error.' },
      ]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  const agentLoop = async (fullMessages: ApiMessage[], history: ApiMessage[]) => {
    let currentMessages = [...fullMessages];
    let currentHistory = [...history];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const data = await callApi(currentMessages);
      const choice = data.choices?.[0];

      if (!choice) {
        setDisplayMessages(prev => [
          ...prev,
          { role: 'assistant', content: lang === 'fr' ? 'Désolé, réessayez.' : 'Sorry, try again.' },
        ]);
        return;
      }

      const msg = choice.message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        const assistantMsg: ApiMessage = { role: 'assistant', content: msg.content ?? '', tool_calls: msg.tool_calls };
        currentMessages.push(assistantMsg);
        currentHistory.push(assistantMsg);

        for (const tc of msg.tool_calls) {
          const fnName = tc.function.name;
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.function.arguments || '{}'); } catch { }

          setToolStatus(fnName.replace(/_/g, ' '));

          const result = await executeTool(fnName, args, user!.id);

          setDisplayMessages(prev => [
            ...prev,
            { role: 'tool', content: fnName.replace(/_/g, ' '), toolName: fnName },
          ]);

          const toolMsg: ApiMessage = { role: 'tool', tool_call_id: tc.id, content: result };
          currentMessages.push(toolMsg);
          currentHistory.push(toolMsg);
        }

        setToolStatus(null);
        continue;
      }

      const reply = msg.content || (lang === 'fr' ? 'Terminé.' : 'Done.');
      const assistantReply: ApiMessage = { role: 'assistant', content: reply };
      currentHistory.push(assistantReply);
      setApiHistory(currentHistory);
      setDisplayMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      return;
    }

    const fallback: ApiMessage = { role: 'assistant', content: lang === 'fr' ? 'Terminé.' : 'Done.' };
    currentHistory.push(fallback);
    setApiHistory(currentHistory);
    setDisplayMessages(prev => [...prev, { role: 'assistant', content: fallback.content as string }]);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-28 right-6 z-[90] w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_30px_rgba(255,77,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-28 right-6 z-[90] w-[360px] max-h-[520px] flex flex-col rounded-3xl overflow-hidden border border-border shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-90 slide-in-from-bottom-4 duration-200"
          style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-display text-sm font-black text-text-main uppercase tracking-tight">FitBot</span>
                <p className="text-[9px] text-text-dim font-medium uppercase tracking-widest">AI Coach</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-surface/50 transition-colors">
              <X className="w-4 h-4 text-text-dim" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[360px]">
            {displayMessages.length === 0 && !loading && (
              <p className="text-center text-text-dim text-xs py-10 font-micro tracking-widest">
                {lang === 'fr' ? 'POSEZ UNE QUESTION FITNESS' : 'ASK A FITNESS QUESTION'}
              </p>
            )}
            {displayMessages.map((m, i) => {
              if (m.role === 'tool') {
                return (
                  <div key={i} className="flex justify-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold">
                      <Wrench className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{m.content}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-surface/80 text-text-main border border-border rounded-bl-md'
                      }`}
                  >
                    {m.role === 'assistant' ? <MarkdownContent text={m.content} /> : m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-surface/80 border border-border flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  {toolStatus && (
                    <span className="text-[9px] text-text-dim font-bold uppercase tracking-widest">{toolStatus}...</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-4 py-3 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'fr' ? 'Message...' : 'Message...'}
              className="flex-1 h-10 px-4 rounded-xl bg-surface/50 border border-border text-text-main text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-30 hover:bg-primary/80 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
