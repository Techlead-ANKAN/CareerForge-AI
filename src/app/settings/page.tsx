"use client";

import { useState, useEffect } from "react";
import { Settings, Key, CheckCircle, AlertCircle, ExternalLink, Cpu, RefreshCw } from "lucide-react";
import { getModelOptions } from "@/lib/ai/gemini";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [modelSaved, setModelSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored) {
      setApiKey(stored);
      setHasKey(true);
    }
    const storedModel = localStorage.getItem("gemini_model");
    if (storedModel) setSelectedModel(storedModel);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setHasKey(false);
    setTestResult(null);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem("gemini_model", model);
    setModelSaved(true);
    setTestResult(null);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: "Please enter an API key first." });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const result = await model.generateContent("Respond with just the word: OK");
      const text = result.response.text();
      if (text) {
        setTestResult({ ok: true, message: `✅ Connected! Model "${selectedModel}" responded.` });
      } else {
        setTestResult({ ok: false, message: "Model returned empty response." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        setTestResult({ ok: false, message: `⚠️ Quota exceeded for "${selectedModel}". Try a different model.` });
      } else if (msg.includes("401") || msg.includes("403")) {
        setTestResult({ ok: false, message: "🔑 Invalid API key. Please check and try again." });
      } else if (msg.includes("404")) {
        setTestResult({ ok: false, message: `❌ Model "${selectedModel}" not found. Try a different model.` });
      } else {
        setTestResult({ ok: false, message: `Error: ${msg.slice(0, 150)}` });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto">
      <PageHeader
        icon={Settings}
        title="API Settings"
        subtitle="Configure your Gemini API key"
      />

      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
        hasKey
          ? "border-success/30 bg-success/5 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
          : "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
      }`}>
        {hasKey ? (
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
        )}
        <span className={`text-sm font-medium ${hasKey ? "text-success" : "text-amber-500"}`}>
          {hasKey ? "API key configured — all features are active" : "No API key set — features won't work without it"}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: API Key */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Key className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Gemini API Key</h2>
                <p className="text-[11px] text-muted-foreground">Your key is stored locally in the browser</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="gap-1.5">
                {saved ? (
                  <><CheckCircle className="h-3.5 w-3.5" /> Saved!</>
                ) : (
                  "Save Key"
                )}
              </Button>
              {hasKey && (
                <Button variant="destructive" onClick={handleClear} size="sm">
                  Clear Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Model Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">AI Model</h2>
                {modelSaved && <span className="text-[11px] text-success">Saved!</span>}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              If you hit quota limits on one model, switch to another.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {getModelOptions().map((model) => (
                <button
                  key={model}
                  onClick={() => handleModelChange(model)}
                  className={`text-left p-3 rounded-xl border transition-all duration-300 ${
                    selectedModel === model
                      ? "border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.12)] ring-1 ring-primary/20"
                      : "border-glass-border bg-glass-bg hover:border-[rgba(139,92,246,0.2)] hover:bg-surface-3"
                  }`}
                >
                  <div className="text-xs font-semibold">{model}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {model === "gemini-2.0-flash" && "Newest & fastest"}
                    {model === "gemini-1.5-flash" && "High free-tier quota"}
                    {model === "gemini-1.5-flash-latest" && "Latest 1.5 flash"}
                    {model === "gemini-1.5-pro" && "Most capable (lower quota)"}
                  </div>
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={testConnection}
              disabled={testing}
              className="gap-2 w-full"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Testing..." : "Test Connection"}
            </Button>

            {testResult && (
              <div className={`mt-3 p-3 rounded-xl border text-xs backdrop-blur-sm ${
                testResult.ok
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}>
                {testResult.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips & Instructions — full width grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-base">💡</span> Quota & Rate Limit Tips
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                Free tier has limited requests per minute/day per model
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                If you hit quota on <strong className="text-foreground">gemini-2.0-flash</strong>, switch to <strong className="text-foreground">gemini-1.5-flash</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                The app automatically retries with backoff and falls back to other models
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                Use the <strong className="text-foreground">Test Connection</strong> button to verify which model works
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                Wait 1-2 minutes between heavy operations to avoid rate limits
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-base">🔑</span> How to get a Gemini API Key
            </h3>
            <ol className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">1</span>
                Visit Google AI Studio
              </li>
              <li className="flex items-start gap-2.5">
                <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">2</span>
                Sign in with your Google account
              </li>
              <li className="flex items-start gap-2.5">
                <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">3</span>
                Click &ldquo;Get API Key&rdquo; and create a key
              </li>
              <li className="flex items-start gap-2.5">
                <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">4</span>
                Paste the key above and save
              </li>
            </ol>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-xs text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Open Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
