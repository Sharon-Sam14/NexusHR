import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Sparkle, X, PaperPlaneRight, ChatText } from "@phosphor-icons/react";
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

  useEffect(() => {
    const handleOpen = () => setIsAiOpen(true);
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  useEffect(() => {
    aiService.getInsights().then(setInsights).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let response = "I'm analyzing the employee data but could not find a specific match. Try asking about 'attrition risks', 'skill gaps', or 'engagement ratings'.";
      const query = userText.toLowerCase();

      if (query.includes("attrition") || query.includes("leave") || query.includes("quit") || query.includes("risk")) {
        if (insights?.attritionRisks?.length) {
          const high = insights.attritionRisks.filter((r) => r.riskLevel === "HIGH");
          if (high.length) {
            response = `I have identified ${high.length} high attrition risk profile(s):\n\n${high.map((r) => `• **${r.employeeName}** (${r.riskPercentage.toFixed(1)}%): ${r.reasons[0]}`).join("\n")}\n\n**Recommendation:** Propose stay reviews or compensation adjustments.`;
          } else {
            response = "Workforce metrics look stable! No employees exhibit high attrition risk profiles right now.";
          }
        } else {
          response = "Based on mock logs, Amit Mehta exhibits a high attrition risk (78.5%) due to below-market salary. Recommendation: Schedule stay interview.";
        }
      } else if (query.includes("skill") || query.includes("gap") || query.includes("competency")) {
        response = "The HR department exhibits a 50% gap in 'Biometric Integration APIs'. Suggest allocating training budget Q3.";
      } else if (query.includes("engagement") || query.includes("score") || query.includes("happy")) {
        response = "Workforce engagement averages 88.5%. Amit Mehta is lowest at 72.0% due to commute tardiness logs.";
      } else if (query.includes("hello") || query.includes("hi")) {
        response = "Hello! How can I assist you with HR predictive analytics today?";
      }

      setMessages((prev) => [...prev, { sender: "ai", text: response }]);
    }, 1000);
  };

  const triggerPrompt = (text) => {
    setInput(text);
    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 50);
  };

  return (
    <div
      className="min-h-screen flex relative"
      style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>

      {/* Floating AI Button */}
      {isHR() && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-[14px] flex items-center justify-center z-40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: "var(--brand-blue)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
          }}
          title="HR Co-Pilot"
        >
          <ChatText size={20} weight="fill" />
        </button>
      )}

      {/* AI Drawer */}
      {isHR() && (
        <AnimatePresence>
          {isAiOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAiOpen(false)}
                className="fixed inset-0 bg-black/50 z-[998]"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                className="fixed right-0 top-0 bottom-0 w-[380px] z-[999] flex flex-col"
                style={{
                  background: "var(--bg-card)",
                  borderLeft: "1px solid var(--border-card)",
                  boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
                }}
              >
                {/* Drawer Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                  style={{ borderBottom: "1px solid var(--border-divider)" }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: "var(--brand-blue-soft)" }}
                  >
                    <Sparkle size={16} weight="duotone" style={{ color: "var(--brand-blue)" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                      Nexus AI
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-success)", fontFamily: "var(--font-mono)" }}>
                      ● online
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAiOpen(false)}
                    className="ml-auto w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-[12px]"
                        style={{
                          background: m.sender === "user" ? "var(--brand-blue)" : "var(--bg-card-alt)",
                          color: m.sender === "user" ? "#fff" : "var(--text-secondary)",
                          border: m.sender === "user" ? "none" : "1px solid var(--border-card)",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div
                        className="px-4 py-2.5 rounded-[12px] flex items-center gap-1.5"
                        style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border-card)" }}
                      >
                        {[0, 150, 300].map((delay) => (
                          <span key={delay}
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: "var(--brand-blue)", animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Prompt Chips */}
                <div className="px-4 py-3 space-y-2" style={{ borderTop: "1px solid var(--border-divider)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Suggested
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "🔍 Turnover Risks", text: "Analyze employee attrition risks" },
                      { label: "🎓 Skill Gaps", text: "Where are our primary skill gaps?" },
                      { label: "📊 Engagement", text: "Evaluate workforce engagement scores" },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => triggerPrompt(chip.text)}
                        className="px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all cursor-pointer"
                        style={{
                          background: "var(--brand-blue-soft)",
                          color: "var(--brand-blue)",
                          border: "1px solid var(--brand-blue-mid)",
                          fontFamily: "var(--font-ui)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-blue)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-blue-soft)"; e.currentTarget.style.color = "var(--brand-blue)"; }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 flex items-center gap-2"
                  style={{ borderTop: "1px solid var(--border-divider)" }}
                >
                  <input
                    type="text"
                    placeholder="Ask Nexus AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field py-2"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all active:scale-95 cursor-pointer"
                    style={{ background: "var(--brand-blue)", color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
                  >
                    <PaperPlaneRight size={15} weight="fill" />
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
