"use client";

import { useState, useEffect } from "react";
import { Settings, Key, CheckCircle, AlertCircle, ExternalLink, Cpu, RefreshCw } from "lucide-react";
import { getModelOptions } from "@/lib/gemini";

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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">API Settings</h1>
          <p className="text-sm text-muted">Configure your Gemini API key</p>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${
        hasKey ? "bg-success/10 border-success/30" : "bg-accent/10 border-accent/30"
      }`}>
        {hasKey ? (
          <CheckCircle className="w-5 h-5 text-success" />
        ) : (
          <AlertCircle className="w-5 h-5 text-accent" />
        )}
        <span className={`text-sm font-medium ${hasKey ? "text-success" : "text-accent"}`}>
          {hasKey ? "API key configured" : "No API key set — features won't work without it"}
        </span>
      </div>

      {/* API Key Input */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold">Gemini API Key</label>
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key..."
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saved ? "Saved!" : "Save Key"}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="bg-danger/20 hover:bg-danger/30 text-danger px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Clear Key
            </button>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold">AI Model</label>
          {modelSaved && <span className="text-xs text-success ml-2">Saved!</span>}
        </div>
        <p className="text-xs text-muted mb-4">
          If you hit quota limits on one model, switch to another. gemini-1.5-flash typically has higher free-tier limits.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {getModelOptions().map((model) => (
            <button
              key={model}
              onClick={() => handleModelChange(model)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedModel === model
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="text-sm font-medium">{model}</div>
              <div className="text-xs text-muted mt-0.5">
                {model === "gemini-2.0-flash" && "Newest & fastest"}
                {model === "gemini-1.5-flash" && "High free-tier quota"}
                {model === "gemini-1.5-flash-latest" && "Latest 1.5 flash"}
                {model === "gemini-1.5-pro" && "Most capable (lower quota)"}
              </div>
            </button>
          ))}
        </div>

        {/* Test Connection Button */}
        <button
          onClick={testConnection}
          disabled={testing}
          className="flex items-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
          {testing ? "Testing..." : "Test Connection"}
        </button>

        {testResult && (
          <div className={`mt-3 p-3 rounded-xl border text-sm ${
            testResult.ok
              ? "bg-success/10 border-success/30 text-success"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* Quota Tips */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold mb-3">💡 Quota & Rate Limit Tips</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li>• Free tier has limited requests per minute/day per model</li>
          <li>• If you hit quota on <strong className="text-foreground">gemini-2.0-flash</strong>, switch to <strong className="text-foreground">gemini-1.5-flash</strong></li>
          <li>• The app automatically retries with backoff and falls back to other models</li>
          <li>• Use the <strong className="text-foreground">Test Connection</strong> button to verify which model works</li>
          <li>• Wait 1-2 minutes between heavy operations to avoid rate limits</li>
          <li>• Consider using multiple API keys if you need higher throughput</li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-3">How to get a Gemini API Key</h3>
        <ol className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">1</span>
            Visit Google AI Studio
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">2</span>
            Sign in with your Google account
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">3</span>
            Click &ldquo;Get API Key&rdquo; and create a key
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">4</span>
            Paste the key above and save
          </li>
        </ol>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:text-primary-hover transition-colors"
        >
          Open Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
