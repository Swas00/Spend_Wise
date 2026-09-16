import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  Calendar,
  Zap,
  HelpCircle,
  Wallet
} from "lucide-react";
import { askAIAdvisor, getStudentInsights, getCurrentBudget } from "../services/api";

const QUICK_PROMPTS = [
  "Can I afford a ₹2,500 weekend trip with friends?",
  "Where did I spend the most pocket money this month?",
  "How can I save ₹1,500 before month-end?",
  "How do I cut down on late-night Swiggy & Zomato cravings?",
  "What is my safe daily limit for canteen & snacks?",
  "Am I on track to achieve my savings goals?"
];

let msgSeq = 0;
const getNextMsgId = () => {
  msgSeq += 1;
  return `msg-${msgSeq}-${Math.random().toString(36).slice(2, 7)}`;
};

const getNowTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function AIAdvisor() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your SpendWise Campus AI Advisor. I monitor your real-time pocket money, canteen and mess expenses, and daily safe spending limit to ensure your funds last comfortably until the end of the month. Feel free to ask any question regarding spending, budgeting, or savings!",
      time: "Now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [budget, setBudget] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadSnapshot() {
      try {
        const [insightsData, budgetData] = await Promise.allSettled([
          getStudentInsights(),
          getCurrentBudget()
        ]);
        if (insightsData.status === "fulfilled") setInsights(insightsData.value);
        if (budgetData.status === "fulfilled") setBudget(budgetData.value);
      } catch (err) {
        console.error("Failed to load advisor context:", err);
      }
    }
    loadSnapshot();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const prompt = (queryText || input).trim();
    if (!prompt || loading) return;

    const userMessage = {
      id: getNextMsgId(),
      sender: "user",
      text: prompt,
      time: getNowTime()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const response = await askAIAdvisor(prompt);
      const aiReply = {
        id: getNextMsgId(),
        sender: "ai",
        text: response.reply || "I analyzed your ledger, but couldn't generate specific advice right now.",
        time: getNowTime(),
        dataSnapshot: response.contextSnapshot
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorReply = {
        id: getNextMsgId(),
        sender: "ai",
        text: "I encountered an issue consulting your financial records: " + (err.message || "Network error") + ". Please try again shortly.",
        time: getNowTime(),
        isError: true
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Campus Intelligence &bull; Indian Student Fiscal Counsel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-serif">
            Campus AI Advisor (Student Financial Guide)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personalized guidance on college pocket money, affordability queries, and spending pacing.
          </p>
        </div>
      </div>

      {/* Real-time Student Health Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Remaining Budget</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            ₹{Number(budget?.remainingBudget || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {budget?.totalBudget ? `${Math.round(budget.percentUsed || 0)}% of limit utilized` : "No limit set"}
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Daily Safe Limit</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold font-serif text-amber-600 dark:text-amber-400">
            ₹{Number(budget?.dailySpendingLimit || 0).toLocaleString("en-IN")}
            <span className="text-xs font-normal text-slate-400"> / day</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Safe pace till month end</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Weekend Surge</span>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            {insights?.weekendVelocity ? `${insights.weekendVelocity}x` : "1.0x"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Relative to weekdays</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Month-End Forecast</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            ₹{Number(insights?.projectedMonthlySpend || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">At current daily burn rate</p>
        </div>
      </div>

      {/* Main Conversational Layout */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md backdrop-blur-xs flex flex-col h-[600px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                SpendWise Autonomous Advisor
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Trained on student budget constraints & savings strategies
              </p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-xs shadow-sm"
                    : msg.isError
                    ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-tl-xs"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-xs shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === "user"
                      ? "text-slate-900/70"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  You
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-xs p-4 text-sm text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs ml-1 font-medium">Consulting ledger...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick Prompts:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="btn-press text-xs shrink-0 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g., 'Can I buy shoes for ₹1,800?', 'What is my canteen budget?')..."
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-press px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Advisor</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAdvisor;
