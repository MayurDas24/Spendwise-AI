import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import toast from "react-hot-toast";

import api from "../lib/axios.js";

const SUGGESTIONS = [
  "How can I save more money?",
  "Analyze my spending habits",
  "What are my biggest expenses?",
  "Can I afford a new laptop?",
  "How much recurring expense do I have?",
];

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // ======================================
  // LOAD CHAT HISTORY
  // ======================================

  const loadHistory = async () => {
    try {
      const res = await api.get("/ai-chat/history");

      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ======================================
  // SEND MESSAGE
  // ======================================

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      message: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    setLoading(true);

    try {
      const res = await api.post("/ai-chat", {
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: res.data.reply,
        },
      ]);
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* HEADER */}

      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="text-white" size={20} />
        </div>

        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">
            AI Finance Assistant
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Powered by Gemini AI
          </p>
        </div>
      </div>

      {/* SUGGESTIONS */}

      <div className="px-5 pt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="px-3 py-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-slate-700 dark:text-slate-300 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* CHAT */}

      <div className="h-[500px] overflow-y-auto p-5 space-y-4">
        
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                <Bot className="text-white" size={28} />
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Ask your AI Finance Assistant
              </h3>

              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                Analyze spending, subscriptions, recurring expenses,
                savings potential, budgets, and financial habits.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-5 py-4 shadow-sm ${
                  isUser
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isUser ? (
                    <User size={15} />
                  ) : (
                    <Bot size={15} />
                  )}

                  <span className="text-xs font-semibold opacity-80">
                    {isUser ? "You" : "ExpenseAI"}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl px-5 py-4">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce delay-100" />
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}

      <div className="p-5 border-t border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask anything about your finances..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 hover:scale-105 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;