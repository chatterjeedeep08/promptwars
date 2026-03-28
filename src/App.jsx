import { useState, useCallback } from 'react';
import { Key, RefreshCw, Activity, Zap } from 'lucide-react';
import './index.css';

import ApiKeyPrompt from './components/ApiKeyPrompt';
import InputPanel from './components/InputPanel';
import PipelineVisualizer, { PIPELINE_STAGES } from './components/PipelineVisualizer';
import IntentCard from './components/IntentCard';
import ContextPanel from './components/ContextPanel';
import ActionOrchestrator from './components/ActionOrchestrator';

import { analyzeInput } from './services/geminiService';
import { getContext } from './services/contextService';
import { runDecisionEngine } from './services/decisionEngine';

const STAGE_IDS = PIPELINE_STAGES.map(s => s.id);
const STAGE_DELAYS = { input: 600, gemini: 0, intent: 500, context: 700, decision: 600, action: 500, output: 400 };

export default function App() {
  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('bridge_ai_key') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [completedStages, setCompletedStages] = useState([]);

  const [geminiOutput, setGeminiOutput] = useState(null);
  const [contextData, setContextData] = useState(null);
  const [decisionOutput, setDecisionOutput] = useState(null);
  const [error, setError] = useState('');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const activateStage = useCallback(async (stageId, duration = 600) => {
    setCurrentStage(stageId);
    await sleep(duration);
    setCompletedStages(prev => [...prev, stageId]);
    setCurrentStage('');
  }, []);

  const handleAnalyze = async ({ text, type, imageBase64, mimeType }) => {
    if (!text && !imageBase64) return;
    setIsProcessing(true);
    setError('');
    setGeminiOutput(null);
    setContextData(null);
    setDecisionOutput(null);
    setCompletedStages([]);
    setCurrentStage('');

    try {
      // Stage 1: Input Processing
      await activateStage('input', STAGE_DELAYS.input);

      // Stage 2: Gemini AI — real API call
      setCurrentStage('gemini');
      const geminiResult = await analyzeInput(text, apiKey, type, imageBase64, mimeType);
      setCompletedStages(prev => [...prev, 'gemini']);
      setCurrentStage('');

      // Stage 3: Intent Engine
      await activateStage('intent', STAGE_DELAYS.intent);
      setGeminiOutput(geminiResult);

      // Stage 4: Context Enrichment
      await activateStage('context', STAGE_DELAYS.context);
      const ctx = await getContext(geminiResult.intent);
      setContextData(ctx);

      // Stage 5: Decision Engine
      await activateStage('decision', STAGE_DELAYS.decision);
      const decision = runDecisionEngine(geminiResult, ctx);
      setDecisionOutput(decision);

      // Stage 6: Action Orchestrator
      await activateStage('action', STAGE_DELAYS.action);

      // Stage 7: Output
      await activateStage('output', STAGE_DELAYS.output);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your API key and try again.');
      console.error('BridgeAI error:', err);
    } finally {
      setIsProcessing(false);
      setCurrentStage('');
    }
  };

  const handleReset = () => {
    setGeminiOutput(null);
    setContextData(null);
    setDecisionOutput(null);
    setCompletedStages([]);
    setCurrentStage('');
    setError('');
  };

  if (!apiKey) {
    return <ApiKeyPrompt onSave={setApiKey} />;
  }

  const hasResults = !!geminiOutput;

  return (
    <div className="app-layout">
      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🌉</div>
            <span className="logo-text">BridgeAI</span>
            <span className="logo-badge">Gemini-Powered</span>
          </div>

          <div className="header-actions">
            {hasResults && (
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                <RefreshCw size={14} /> New Input
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => {
                localStorage.removeItem('bridge_ai_key');
                setApiKey('');
              }}
              title="Change API Key"
            >
              <Key size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Hero */}
        {!hasResults && !isProcessing && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 48, paddingTop: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)',
              marginBottom: 24, letterSpacing: '0.3px',
            }}>
              <Activity size={12} /> Powered by Gemini 2.5 Flash
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 16,
            }}>
              Human Intent
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                → Real-World Action
              </span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 17, maxWidth: 560,
              margin: '0 auto', lineHeight: 1.7,
            }}>
              The universal bridge between messy, unstructured human input and life-saving, verified, executable actions. Powered by multimodal AI.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--critical)',
            fontSize: 14,
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Zap size={16} />
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: hasResults || isProcessing
            ? 'minmax(0,1fr) 280px'
            : 'minmax(0, 680px)',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'start',
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <InputPanel onAnalyze={handleAnalyze} isProcessing={isProcessing} />

            {/* Results */}
            {geminiOutput && (
              <>
                <IntentCard geminiOutput={geminiOutput} decisionOutput={decisionOutput} />
                <ContextPanel contextData={contextData} urgency={decisionOutput?.urgency || geminiOutput.urgency} />
                <ActionOrchestrator actions={decisionOutput?.actions} urgency={decisionOutput?.urgency} />
              </>
            )}
          </div>

          {/* Right Column — Pipeline */}
          {(isProcessing || hasResults) && (
            <div style={{ position: 'sticky', top: 80 }}>
              <PipelineVisualizer
                isProcessing={isProcessing}
                currentStage={currentStage}
                completedStages={completedStages}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: 64, paddingTop: 24,
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            BridgeAI — Built for societal benefit. Powered by Google Gemini.
            {' '}Not for production medical/legal use without professional oversight.
          </p>
        </footer>
      </main>
    </div>
  );
}
