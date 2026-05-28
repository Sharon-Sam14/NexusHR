import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Sparkles, X, Send, Brain, Bot, HelpCircle, MessageSquare } from "lucide-react";
import { aiService } from "../services/aiService";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const { isHR } = useAuth();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I am your NexusHR AI Co-Pilot. I have loaded live workforce logs. Ask me about attrition risks, skill gaps, or engagement stats!" }
  ]);
  const [input, setInput] = useState("");
  const [insights, setInsights] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Listen to global open command from palette
  useEffect(() => {
    const handleOpen = () => setIsAiOpen(true);
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  // Fetch insights context
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await aiService.getInsights();
        setInsights(data);
      } catch {
        // Fallback context
      }
    };
    fetchInsights();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    // AI thinking simulation
    setTimeout(() => {
      setIsTyping(false);
      let response = "I'm analyzing the employee data but could not find a specific match. Try asking about 'attrition risks', 'skill gaps', or 'engagement ratings'.";

      const query = userText.toLowerCase();

      if (query.includes("attrition") || query.includes("leave") || query.includes("quit") || query.includes("risk")) {
        if (insights?.attritionRisks?.length) {
          const high = insights.attritionRisks.filter(r => r.riskLevel === "HIGH");
          if (high.length) {
            const list = high.map(r => `*   **${r.employeeName}** (${r.riskPercentage.toFixed(1)}%): ${r.reasons[0]}`).join("\n");
            response = `I have identified ${high.length} high attrition risk profile(s) based on salary benchmarks and attendance logs:\n\n${list}\n\n**Recommendation:** Propose staying reviews or compensation adjustments.`;
          } else {
            response = "Workforce metrics look stable! No employees exhibit high attrition risk profiles right now.";
          }
        } else {
          response = "Based on mock logs, David Lee exhibits a high attrition risk (78.5%) due to below-market salary adjustments. Recommendation: Schedule stay interview.";
        }
      } else if (query.includes("skill") || query.includes("gap") || query.includes("competency")) {
        if (insights?.skillGaps?.length) {
          const critical = insights.skillGaps.filter(g => g.gapPercentage >= 35.0);
          if (critical.length) {
            const list = critical.map(g => `*   **${g.departmentName}**: ${g.skillName} — **${g.gapPercentage.toFixed(0)}% Gap**`).join("\n");
            response = `Critical competency gaps detected:\n\n${list}\n\n**Action Plan:** Organize Q2 corporate training workshops.`;
          } else {
            response = "All department skill competencies match required standards. No critical gaps found.";
          }
        } else {
          response = "The HR department exhibits a 50% gap in 'Biometric Integration APIs'. Suggest allocating training budget.";
        }
      } else if (query.includes("engagement") || query.includes("score") || query.includes("happy")) {
        if (insights?.engagementScores?.length) {
          const avg = insights.engagementScores.reduce((acc, curr) => acc + curr.score, 0) / insights.engagementScores.length;
          const low = insights.engagementScores.filter(s => s.score < 80.0);
          response = `Average workforce engagement is **${avg.toFixed(1)}%**.\n\n`;
          if (low.length) {
            response += `Profiles needing support:\n` + low.map(e => `*   **${e.employeeName}** (${e.score}%) due to attendance lates.`).join("\n");
          } else {
            response += "All profiles show healthy engagement indexes above 80%.";
          }
        } else {
          response = "Workforce engagement averages 88.5%. David Lee is lowest at 72.0% due to commute tardiness logs.";
        }
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
        response = "Hello! How can I assist you with HR predictive analytics today?";
      }

      setMessages(prev => [...prev, { sender: "ai", text: response }]);
    }, 1000);
  };

  const triggerPrompt = (text, queryKey) => {
    setInput(text);
    setTimeout(() => {
      const e = { preventDefault: () => {} };
      handleSendMessage(e);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-mesh flex text-slate-100 relative">
      {/* Ambient Shifting Glows */}
      <div className="absolute w-[600px] h-[600px] ambient-glow-cyan blur-3xl rounded-full top-10 left-10 pointer-events-none z-0 opacity-40 animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute w-[600px] h-[600px] ambient-glow-indigo blur-3xl rounded-full bottom-10 right-10 pointer-events-none z-0 opacity-40 animate-pulse" style={{ animationDuration: "16s" }} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen relative z-10">
        <Topbar />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="page-transition"
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>

      {/* Persistent Floating AI Badge */}
      {isHR() && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-650 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 z-40 transition-transform active:scale-90 hover:scale-105 border border-cyan-400/20 group"
        >
          <Brain size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {/* Slide-over AI Drawer */}
      {isHR() && (
        <AnimatePresence>
          {isAiOpen && (
            <>
              {/* Backdrop cover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAiOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[998]"
              />

              {/* Panel */}
              <motion.div
                initial={{ x: 420 }}
                animate={{ x: 0 }}
                exit={{ x: 420 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[380px] bg-slate-950/80 border-l border-slate-900/80 shadow-2xl z-[999] backdrop-blur-3xl flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-900/80 flex items-center justify-between bg-slate-950/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-650 flex items-center justify-center text-white shadow-md">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wider uppercase">HR Co-Pilot</h3>
                      <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider block">Context active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAiOpen(false)}
                    className="btn-icon p-1.5"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Chat log list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed border ${
                          m.sender === "user"
                            ? "bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 border-cyan-500/20 text-white"
                            : "bg-slate-900/60 border-slate-900 text-slate-300"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900/60 border border-slate-900 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Predefined prompt chips */}
                <div className="px-4 py-2 border-t border-slate-950/20 space-y-1.5 bg-slate-950/10">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-1">Suggested Prompts</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => triggerPrompt("Analyze employee attrition risks", "attrition")}
                      className="px-2.5 py-1 rounded-lg border border-slate-900 bg-slate-950 text-[10px] text-slate-400 hover:text-white hover:border-slate-800 transition-colors"
                    >
                      🔍 Turnover Risks
                    </button>
                    <button
                      onClick={() => triggerPrompt("Where are our primary skill gaps?", "skills")}
                      className="px-2.5 py-1 rounded-lg border border-slate-900 bg-slate-950 text-[10px] text-slate-400 hover:text-white hover:border-slate-800 transition-colors"
                    >
                      🎓 Competency Gaps
                    </button>
                    <button
                      onClick={() => triggerPrompt("Evaluate workforce engagement scores", "engagement")}
                      className="px-2.5 py-1 rounded-lg border border-slate-900 bg-slate-950 text-[10px] text-slate-400 hover:text-white hover:border-slate-800 transition-colors"
                    >
                      📊 Engagement Stats
                    </button>
                  </div>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900/80 bg-slate-950/30 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question about employees..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field py-2.5"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-400 hover:to-indigo-550 text-white flex-shrink-0 transition-transform active:scale-95 shadow-md shadow-cyan-500/10"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
