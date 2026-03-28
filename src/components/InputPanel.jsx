import { useState, useRef } from 'react';
import { Mic, MicOff, Type, ImageIcon, FileText, Loader2, ChevronRight, Sparkles } from 'lucide-react';

const DEMO_SCENARIOS = [
  {
    id: 'medical',
    icon: '🚨',
    label: 'Medical Emergency',
    inputType: 'voice',
    text: 'My father suddenly grabbed his chest and fell to the floor. He\'s barely conscious and breathing very strangely. I\'m panicking, I don\'t know what to do!',
  },
  {
    id: 'flood',
    icon: '🌊',
    label: 'Flood Disaster',
    inputType: 'text',
    text: 'Water is flooding our entire street, it\'s already waist deep and rising fast. There are elderly people trapped on the ground floor. Nobody is coming to help us!',
  },
  {
    id: 'prescription',
    icon: '💊',
    label: 'Prescription Scan',
    inputType: 'text',
    text: 'I have a handwritten prescription from an old doctor: Metformin 500mg twice daily, Lisinopril 10mg once morning, Atorvastatin 20mg once night. Patient has history of kidney stones. Is this combination safe?',
  },
  {
    id: 'accident',
    icon: '🚗',
    label: 'Road Accident',
    inputType: 'text',
    text: 'There\'s been a bad collision at the highway junction near me. Two cars completely crumpled, I can see someone slumped over the wheel and another person is screaming. Nobody has called for help yet.',
  },
  {
    id: 'legal',
    icon: '⚖️',
    label: 'Legal Notice',
    inputType: 'text',
    text: 'I received a court notice today saying my landlord is suing me for unpaid rent but I have all my rent receipts and bank statements showing I paid everything on time. The hearing is in 7 days and I have no idea what to do.',
  },
];

export default function InputPanel({ onAnalyze, isProcessing }) {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'image', label: 'Image', icon: ImageIcon },
  ];

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setTranscript(text);
    };
    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e);
      stopRecording();
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      // Extract base64 without the data URL prefix
      const base64 = e.target.result.split(',')[1];
      setImageBase64(base64);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const getActiveInput = () => {
    if (activeTab === 'voice') return transcript;
    if (activeTab === 'image') return textInput || 'Analyze this image';
    return textInput;
  };

  const canAnalyze = () => {
    if (isProcessing) return false;
    if (activeTab === 'voice') return transcript.trim().length > 5;
    if (activeTab === 'image') return !!imageBase64;
    return textInput.trim().length > 5;
  };

  const handleAnalyze = () => {
    if (!canAnalyze()) return;
    onAnalyze({
      text: getActiveInput(),
      type: activeTab,
      imageBase64: activeTab === 'image' ? imageBase64 : null,
      mimeType: activeTab === 'image' ? imageMime : null,
    });
  };

  const loadDemo = (scenario) => {
    setActiveTab(scenario.inputType === 'voice' ? 'text' : scenario.inputType);
    setTextInput(scenario.text);
    setTranscript('');
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Demo Scenarios */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="section-label">Demo Scenarios</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEMO_SCENARIOS.map(s => (
            <button
              key={s.id}
              className="btn btn-ghost btn-sm"
              onClick={() => loadDemo(s)}
              style={{ gap: 6 }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 4,
          marginBottom: 20,
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  borderBottom: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="animate-fade-in">
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Describe what's happening in your own words — messy, urgent, emotional, medical, legal. BridgeAI understands it all..."
              rows={6}
              style={{
                width: '100%', padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.7,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {textInput.length} chars
              </span>
            </div>
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{
              width: 120, height: 120,
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isRecording ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
              border: `2px solid ${isRecording ? 'var(--critical)' : 'rgba(99,102,241,0.3)'}`,
              transition: 'all 0.3s',
              cursor: 'pointer',
              ...(isRecording ? { animation: 'pulse-critical 1.5s ease infinite' } : {}),
            }} onClick={isRecording ? stopRecording : startRecording}>
              {isRecording
                ? <MicOff size={40} color="var(--critical)" />
                : <Mic size={40} color="var(--accent-primary)" />
              }
            </div>

            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ color: 'var(--critical)', fontSize: 13, fontWeight: 600 }}>● REC</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              {isRecording ? 'Speaking... click to stop' : 'Click to start recording your input'}
            </p>

            {transcript && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                textAlign: 'left', fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-primary)', maxHeight: 140, overflowY: 'auto',
              }}>
                {transcript}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {!isRecording && (
                <button className="btn btn-primary" onClick={startRecording}>
                  <Mic size={14} /> Start Recording
                </button>
              )}
              {isRecording && (
                <button className="btn btn-danger" onClick={stopRecording}>
                  <MicOff size={14} /> Stop Recording
                </button>
              )}
              {transcript && !isRecording && (
                <button className="btn btn-ghost btn-sm" onClick={() => setTranscript('')}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="animate-fade-in">
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <ImageIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
                  Drop an image or click to upload
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Medical scans, accident scenes, documents, disaster photos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleImageUpload(e.target.files[0])}
                />
              </div>
            ) : (
              <div>
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  style={{
                    width: '100%', maxHeight: 200, objectFit: 'contain',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    marginBottom: 12,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder="Add context about the image (optional)..."
                    style={{
                      flex: 1, padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setImageFile(null); setImagePreview(null); setImageBase64(null); }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze Button */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={!canAnalyze()}
            style={{ minWidth: 200, justifyContent: 'center' }}
          >
            {isProcessing ? (
              <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing...</>
            ) : (
              <><Sparkles size={16} /> Analyze with Gemini <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
