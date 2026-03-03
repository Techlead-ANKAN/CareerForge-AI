"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Play,
  Square,
  RotateCcw,
  Settings,
  MessageSquare,
  Volume2,
  User,
  Bot,
} from "lucide-react";
import { getApiKey, generateWithRetry } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const interviewTypes = [
  { id: "technical", label: "Technical Interview", description: "DSA, System Design, Coding" },
  { id: "behavioral", label: "Behavioral Interview", description: "STAR method, Leadership" },
  { id: "system-design", label: "System Design", description: "Architecture, Scalability" },
  { id: "hr", label: "HR Round", description: "Culture fit, Salary negotiation" },
  { id: "custom", label: "Custom Topic", description: "Specify your own topic" },
];

export default function InterviewPrepPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewType, setInterviewType] = useState("technical");
  const [targetRole, setTargetRole] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;

    synthRef.current.cancel();
    // Clean markdown for speech
    const cleanText = text
      .replace(/[#*`_~\[\]()]/g, "")
      .replace(/\n+/g, ". ")
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getSystemPrompt = () => {
    const type = interviewTypes.find((t) => t.id === interviewType);
    const topic = interviewType === "custom" ? customTopic : type?.label;

    return `You are an expert interview coach conducting a live ${topic} interview simulation for a ${targetRole || "software engineering"} position.

Difficulty: ${difficulty}

Your behavior:
- Act as a real interviewer — professional, conversational, and adaptive
- Ask ONE question at a time
- After the candidate responds, provide brief constructive feedback
- Then ask a follow-up or new question
- Adjust difficulty based on responses
- For technical questions, test understanding not just memorization
- For behavioral, expect STAR format answers
- Be encouraging but honest about areas for improvement
- Keep responses concise (2-3 paragraphs max)

If this is the first message, start by:
1. Briefly introducing yourself as the interviewer
2. Asking an ice-breaker or first interview question appropriate to the type

Current conversation context will be provided. Continue naturally from where we left off.`;
  };

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text) return;

    const key = getApiKey();
    if (!key) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Please configure your Gemini API key in Settings first.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
        .join("\n\n");

      const prompt = `${getSystemPrompt()}

CONVERSATION SO FAR:
${history}

Candidate: ${text}

Interviewer:`;

      const aiText = await generateWithRetry(prompt);

      const aiMessage: Message = { role: "ai", content: aiText, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);

      // Speak the response
      if (voiceEnabled) {
        speak(aiText);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get response";
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Error: ${message}`, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setMessages([]);
    // Send a trigger message to start
    sendMessage("Hello, I'm ready for the interview. Let's begin.");
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setMessages([]);
    setInput("");
    stopSpeaking();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!interviewStarted) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Live Interview Prep</h1>
            <p className="text-sm text-muted">Practice with AI interviewer using voice or text</p>
          </div>
        </div>

        {/* Setup */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4">Interview Setup</h3>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted mb-2 block">Target Role</label>
            <input
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted mb-2 block">Interview Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {interviewTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInterviewType(t.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    interviewType === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-xs text-muted mt-0.5">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {interviewType === "custom" && (
            <div className="mb-4">
              <label className="text-xs font-medium text-muted mb-2 block">Custom Topic</label>
              <input
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="e.g., React Performance Optimization, AWS Services"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-medium text-muted mb-2 block">Difficulty</label>
            <div className="flex gap-3">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    difficulty === d
                      ? "bg-primary text-white"
                      : "bg-background border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                voiceEnabled
                  ? "bg-success/10 border border-success/30 text-success"
                  : "bg-card border border-border text-muted"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Voice {voiceEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>

        <button
          onClick={startInterview}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6" /> Start Interview
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Live Interview</h1>
            <p className="text-xs text-muted">
              {interviewTypes.find((t) => t.id === interviewType)?.label} — {targetRole || "General"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              voiceEnabled ? "border-success/30 text-success" : "border-border text-muted"
            }`}
            title={voiceEnabled ? "Voice On" : "Voice Off"}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={resetInterview}
            className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted hover:text-foreground transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              <div className="markdown-content text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <div className="text-xs text-muted/50 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
          <Volume2 className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">AI is speaking...</span>
          <button
            onClick={stopSpeaking}
            className="ml-auto px-2 py-1 text-xs bg-primary/20 rounded-lg text-primary hover:bg-primary/30"
          >
            Stop
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 bg-card border border-border rounded-2xl p-3">
        <div className="flex items-end gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition-all shrink-0 ${
              isListening
                ? "bg-danger text-white animate-pulse-glow"
                : "bg-background border border-border text-muted hover:text-primary hover:border-primary/50"
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <textarea
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none min-h-[44px] max-h-32"
            placeholder={isListening ? "Listening... speak now" : "Type your answer or click the mic..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-xs text-danger font-medium">Recording...</span>
          </div>
        )}
      </div>
    </div>
  );
}
