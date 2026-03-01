import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Activity, Code, Bug, Clock, Cpu, BookOpen, AlertCircle, Sun, Moon, Search, TerminalSquare, XCircle, CheckCircle, Zap, Settings, CheckSquare, ShieldCheck, Brain, Languages, LayoutDashboard, Palette, Instagram, AtSign, User, LogIn, LogOut } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import WebGLBackground from './WebGLBackground';
import ReactMarkdown from 'react-markdown';
import Dashboard from './Dashboard';
import Login from './Login';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

const MarkdownRenderer = ({ content, theme }) => (
  <div className="markdown-content">
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, '')}
              style={theme === 'light' ? vs : vscDarkPlus}
              language={match ? match[1] : 'javascript'}
              PreTag="div"
              customStyle={{ borderRadius: '8px', margin: '1rem 0' }}
            />
          ) : (
            <code {...props} className={`inline-code ${className || ''}`}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);


const LOADING_STAGES = [
  "Analyzing code logic...",
  "Finding potential bugs...",
  "Generating optimal fix...",
  "Finalizing insights..."
];

const THEMES = [
  { id: 'light', label: 'Light', color: '#e5e7eb' },
  { id: 'red-mars', label: 'Red Mars', color: '#ef4444' },
  { id: 'green-aurora', label: 'Green Aurora', color: '#10b981' },
  { id: 'blue-earth', label: 'Blue Earth', color: '#3b82f6' }
];

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' }
];

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [showLogin, setShowLogin] = useState(false);

  const [code, setCode] = useState('// Write your code here...\nfunction add(a, b) {\n  return a + b;\n}\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const [learningMode, setLearningMode] = useState('beginner');
  const [explanationLanguage, setExplanationLanguage] = useState('english');

  // New features state
  const [emptyHintIndex, setEmptyHintIndex] = useState(0);
  const emptyHints = [
    "Paste a recursive function to check for infinite loops",
    "Try an off-by-one bug to see edge case detection",
    "Test your algorithm for Big-O complexity analysis",
    "Click DEBUG ALL to begin full intelligent analysis"
  ];

  useEffect(() => {
    let interval;
    if (!loading && !result) {
      interval = setInterval(() => {
        setEmptyHintIndex((prev) => (prev + 1) % emptyHints.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading, result]);

  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Selector state
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Theme Selector state
  const [themeOpen, setThemeOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  // Profile Selector state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Editor Idle state
  const [editorIdle, setEditorIdle] = useState(false);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    setEditorIdle(false);
    clearTimeout(idleTimerRef.current);

    if (!isEditorFocused) {
      idleTimerRef.current = setTimeout(() => {
        setEditorIdle(true);
      }, 3000);
    }

    return () => clearTimeout(idleTimerRef.current);
  }, [isEditorFocused, code]);

  // Theme state MUST be declared before scroll logic uses it
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'red-mars';
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll Journey logic for red-to-blue transition
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
          const winHeight = document.documentElement.clientHeight;
          const docHeight = document.documentElement.scrollHeight;
          const maxScroll = Math.max(docHeight - winHeight, 1);
          const scrollPercent = Math.min(scrollPx / maxScroll, 1);

          document.documentElement.style.setProperty('--scroll-blend', scrollPercent.toFixed(3));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const changeTheme = (newTheme, e) => {
    if (theme === newTheme) {
      setThemeOpen(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(newTheme);
      setThemeOpen(false);
      return;
    }

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
    setThemeOpen(false);
  };

  const outputRef = useRef(null);

  // Parallax Tilt Handler for Cards
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize to -1 to 1
    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;

    card.style.setProperty('--card-rx', nx.toFixed(3));
    card.style.setProperty('--card-ry', ny.toFixed(3));
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--card-rx', '0');
    card.style.setProperty('--card-ry', '0');
  };

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Loading stages simulation
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidFocusEditorText(() => setIsEditorFocused(true));
    editor.onDidBlurEditorText(() => setIsEditorFocused(false));
  };

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (result && result.bugs && result.bugs.length > 0) {
        const markers = result.bugs.map((bug) => ({
          startLineNumber: bug.line,
          startColumn: 1,
          endLineNumber: bug.line,
          endColumn: 1000,
          message: `${bug.issue}\n\nFix: ${bug.fix}`,
          severity: monacoRef.current.MarkerSeverity.Error,
        }));
        monacoRef.current.editor.setModelMarkers(model, 'owner', markers);
      } else {
        monacoRef.current.editor.setModelMarkers(model, 'owner', []);
      }
    }
  }, [result]);

  // Command Palette Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((prev) => !prev);
        setPaletteQuery('');
        setPaletteIndex(0);
      }
      if (e.key === 'Escape' && showPalette) {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPalette]);

  // Scroll Reveal Observer
  useEffect(() => {
    // Only run if we are not showing the dashboard (meaning App's main content is mounted)
    if (showDashboard) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    // Yield control briefly to ensure DOM paint has rendered the nodes
    const timer = setTimeout(() => {
      const featureSections = document.querySelectorAll('.feature-section');
      featureSections.forEach(sec => observer.observe(sec));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [showDashboard]);

  const handleDebugClick = (e) => {
    const button = e.currentTarget;
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    const circle = document.createElement("span");
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }
    button.appendChild(circle);

    handleAnalyze();
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingStage(0);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          language,
          code
        })
      });

      const data = await response.json();

      setResult({
        type: "text",
        title: "Explanation",
        content: data.result
      });
    } catch (error) {
      console.error(error);
      setResult({ error: "Backend not running or CORS issue" });
    }

    setLoading(false);
  };

  const handleModularAction = async (endpoint) => {
    setLoading(true);
    setLoadingStage(0);
    setResult(null);

    const mapping = {
      explain: "explain",
      improve: "bug",
      optimize: "optimize",
      test: "testcase",
      complexity: "complexity",
      learning: "learning"
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/${mapping[endpoint]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            language,
            code
          })
        }
      );

      const data = await response.json();

      let finalContent = data.result;
      if ((endpoint === 'improve' || endpoint === 'optimize') && !finalContent.includes('```')) {
        finalContent = `\`\`\`${language}\n${finalContent}\n\`\`\``;
      }

      setResult({
        type: "text",
        title: mapping[endpoint].toUpperCase(),
        content: finalContent
      });
    } catch (error) {
      console.error(error);
      setResult({ error: "Backend not running or CORS issue" });
    }

    setLoading(false);
  };

  const paletteCommands = [
    { id: 'debug', icon: <Play size={16} />, label: 'Debug Code', action: () => { setShowPalette(false); handleAnalyze(); } },
    { id: 'theme', icon: <Palette size={16} />, label: 'Change Theme', action: () => { setThemeOpen(true); setShowPalette(false); } },
    { id: 'clear', icon: <XCircle size={16} />, label: 'Clear Editor', action: () => { setCode(''); setShowPalette(false); } },
  ].filter(cmd => cmd.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPaletteIndex((prev) => (prev + 1) % Math.max(paletteCommands.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPaletteIndex((prev) => (prev - 1 + Math.max(paletteCommands.length, 1)) % Math.max(paletteCommands.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (paletteCommands[paletteIndex]) {
        paletteCommands[paletteIndex].action();
      }
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuthToken(null);
    setUsername(null);
    setShowDashboard(false);
  };

  if (showLogin) {
    return (
      <Login
        onLogin={(token, user) => {
          localStorage.setItem('token', token);
          localStorage.setItem('username', user);
          setAuthToken(token);
          setUsername(user);
          setShowLogin(false);
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  // Render Dashboard securely instead of IDE if showDashboard is true
  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} token={authToken} username={username} />;
  }

  return (
    <div className={`app-container ${isEditorFocused ? 'focus-mode' : ''}`}>
      <WebGLBackground theme={theme} />
      <InteractiveBackground theme={theme} />

      {/* Command Palette Overlay */}
      <div className={`cmd-palette-overlay ${showPalette ? 'open' : ''}`} onClick={() => setShowPalette(false)}>
        <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
          <div className="cmd-header">
            <Search size={20} />
            <input
              type="text"
              autoFocus={showPalette}
              placeholder="Search commands..."
              className="cmd-input"
              value={paletteQuery}
              onChange={(e) => { setPaletteQuery(e.target.value); setPaletteIndex(0); }}
              onKeyDown={handlePaletteKeyDown}
            />
            <span className="cmd-item-shortcut">ESC to close</span>
          </div>
          <div className="cmd-list">
            {paletteCommands.length > 0 ? (
              paletteCommands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  className={`cmd-item ${idx === paletteIndex ? 'active' : ''}`}
                  onClick={cmd.action}
                  onMouseEnter={() => setPaletteIndex(idx)}
                >
                  {cmd.icon}
                  <span>{cmd.label}</span>
                </div>
              ))
            ) : (
              <div className="cmd-item" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                No commands found.
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="header">
        <div className="brand">
          <h1>
            <span className="brand-ojas">OJAS</span> Code Mentor
          </h1>
        </div>
        <div className="controls">
          <button
            className={`mode-toggle ${learningMode === 'pro' ? 'pro-mode' : ''}`}
            onClick={() => setLearningMode(learningMode === 'beginner' ? 'pro' : 'beginner')}
            title={`Switch to ${learningMode === 'beginner' ? 'Pro' : 'Beginner'} mode`}
          >
            <Brain size={16} />
            <span className="mode-text">{learningMode === 'beginner' ? 'Beginner' : 'Pro'} Mode</span>
          </button>

          <button
            className="mode-toggle"
            onClick={() => setExplanationLanguage(explanationLanguage === 'english' ? 'hinglish' : 'english')}
            title={`Switch to ${explanationLanguage === 'english' ? 'Hinglish' : 'English'}`}
          >
            <Languages size={16} />
            <span className="mode-text">{explanationLanguage === 'english' ? 'EN' : 'HI'}</span>
          </button>

          <div className="custom-lang-selector" ref={themeDropdownRef}>
            <button
              className={`theme-toggle ${themeOpen ? 'open' : ''}`}
              onClick={() => setThemeOpen(!themeOpen)}
              title="Select Theme"
            >
              <Palette size={20} />
            </button>
            {themeOpen && (
              <div className="lang-dropdown cloud-morph theme-dropdown">
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    className={`lang-option ${theme === t.id ? 'active' : ''}`}
                    onClick={(e) => changeTheme(t.id, e)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, display: 'inline-block', flexShrink: 0 }}></span>
                    <span style={{ whiteSpace: 'nowrap' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="custom-lang-selector" ref={langDropdownRef}>
            <button
              className={`lang-trigger ${langOpen ? 'open' : ''}`}
              onClick={() => setLangOpen(!langOpen)}
            >
              {LANGUAGES.find(l => l.id === language)?.label || 'JavaScript'}
              <span className="chevron">▼</span>
            </button>
            {langOpen && (
              <div className="lang-dropdown cloud-morph">
                {LANGUAGES.map(lang => (
                  <div
                    key={lang.id}
                    className={`lang-option ${language === lang.id ? 'active' : ''}`}
                    onClick={() => { setLanguage(lang.id); setLangOpen(false); }}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="mode-toggle"
            onClick={() => {
              if (authToken) {
                setShowDashboard(true);
              } else {
                setShowLogin(true);
              }
            }}
            title={authToken ? "View Dashboard" : "Log In to View Dashboard"}
          >
            <LayoutDashboard size={16} />
            <span className="mode-text">Dashboard</span>
          </button>

          <div className="custom-lang-selector" ref={profileDropdownRef}>
            {username ? (
              <>
                <button
                  className={`lang-trigger user-profile-btn ${profileOpen ? 'open' : ''}`}
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <User size={14} /> {username} <span className="chevron">▼</span>
                </button>
                {profileOpen && (
                  <div className="lang-dropdown cloud-morph">
                    <div
                      className="lang-option"
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      style={{ color: 'var(--error)' }}
                    >
                      <LogOut size={14} style={{ marginRight: '0.5rem' }} /> Log Out
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                className="logout-btn"
                onClick={() => setShowLogin(true)}
                title="Log In"
                style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                <LogIn size={14} /> Log In
              </button>
            )}
          </div>

          <button
            onClick={handleDebugClick}
            disabled={loading}
            className="debug-btn"
          >
            <Play size={16} />
            {loading ? 'Analyzing...' : 'Debug Code'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className={`editor-section ${editorIdle ? 'editor-idle' : ''}`}>
          <Editor
            height="100%"
            language={language}
            theme={theme === 'light' ? 'light' : 'vs-dark'}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              wordWrap: 'on',
              padding: { top: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on"
            }}
          />
        </div>

        <div className="output-section">
          <div className="status-strip">
            <span className="status-item"><div className="status-dot"></div> Status: Ready</span>
            <span className="status-item"><Activity size={12} /> AI Engine Active</span>
            <span className="status-item"><Clock size={12} /> Avg Analysis: ~2–3s</span>
            <span className="status-item"><ShieldCheck size={12} /> Edge Detection Enabled</span>
          </div>

          <h2 className="analysis-title">
            Analysis Results
            <div className="capability-badges">
              <span className="badge"><Zap size={12} /> Fast Analysis</span>
              <span className="badge"><BookOpen size={12} /> Deep Reasoning</span>
              <span className="badge"><ShieldCheck size={12} /> Edge Case Aware</span>
            </div>
          </h2>

          {loading && (
            <div className="loading-premium">
              <div className="loading-waveform">
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
              </div>
              <div className="loading-text-container">
                <div className="loading-text">{LOADING_STAGES[loadingStage]}</div>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state">
              <Code size={48} className="empty-icon" />
              <div className="empty-hints-container">
                <p className="empty-hint" key={emptyHintIndex}>
                  {emptyHints[emptyHintIndex]}
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="results">
              <div className="scan-line"></div>
              {result.error ? (
                <>
                  <div className="status error">
                    <AlertCircle size={20} /> Error
                  </div>
                  <div className="issues-card">
                    <p>{result.error}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="status success">
                    <CheckCircle size={20} className="success-icon-anim" /> Status: Success
                  </div>

                  {result._cached && (
                    <div className="status" style={{ background: 'var(--panel-border-glow)', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      <Zap size={14} /> Instant Cache Hit
                    </div>
                  )}

                  {/* Rendering for modular endpoints (text/code/optimization) */}
                  {result.type && result.type !== 'full' && (
                    <div className="opt-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                      <h3>{result.type === 'code' ? <Code size={18} /> : <BookOpen size={18} />} {result.title}</h3>
                      {result.type === 'text' ? (
                        <MarkdownRenderer content={result.content} theme={theme} />
                      ) : (
                        <pre>{result.content}</pre>
                      )}
                      {result.rationale && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
                          <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Rationale</h4>
                          <MarkdownRenderer content={result.rationale} theme={theme} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rendering for full /analyze endpoint */}
                  {(result.type === 'full' || !result.type) && (
                    <>
                      {result.security_vulnerability && result.security_vulnerability !== "None detected" && (
                        <div className="issues-card card stagger-item" style={{ borderTopColor: '#f59e0b' }}>
                          <h3><ShieldCheck size={18} color="#f59e0b" /> Security Note</h3>
                          <MarkdownRenderer content={result.security_vulnerability} theme={theme} />
                        </div>
                      )}

                      {result.maintainability_score && (
                        <div className="metric-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                          <h3><Activity size={18} /> Maintainability Score</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${result.maintainability_score}%`, height: '100%', background: result.maintainability_score > 80 ? 'var(--success)' : result.maintainability_score > 50 ? '#f59e0b' : 'var(--error)' }}></div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>{result.maintainability_score}/100</span>
                          </div>
                        </div>
                      )}

                      {result.summary && (
                        <div className="feedback-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                          <h3><Activity size={18} /> Summary</h3>
                          <MarkdownRenderer content={result.summary} theme={theme} />
                        </div>
                      )}

                      {result.bugs && result.bugs.length > 0 && (
                        <div className="issues-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                          <h3><Bug size={18} /> Issues Found</h3>
                          <ul className="bugs-list">
                            {result.bugs.map((bug, idx) => (
                              <li key={idx} className="bug-item">
                                <span className="bug-line">Line {bug.line}</span>
                                <div className="bug-details">
                                  <p className="bug-issue">{bug.issue}</p>
                                  <p className="bug-fix"><strong>Fix:</strong> {bug.fix}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.fixed_code && (
                        <div className="opt-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                          <h3><Code size={18} /> Fixed & Optimized Code</h3>
                          <pre>{result.fixed_code}</pre>
                        </div>
                      )}

                      {result.complexity && (
                        <div className="metrics-container stagger-item">
                          <div className="metric-card card" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                            <h3><Clock size={18} /> Time Complexity</h3>
                            <p className="metric-value">{result.complexity.time}</p>
                          </div>
                          <div className="metric-card card" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                            <h3><Cpu size={18} /> Space Complexity</h3>
                            <p className="metric-value">{result.complexity.space}</p>
                          </div>
                        </div>
                      )}

                      {result.explanation && (
                        <div className="explanation-card card stagger-item" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                          <h3><BookOpen size={18} /> Explanation</h3>
                          <MarkdownRenderer content={result.explanation} theme={theme} />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Futuristic Action Bar */}
      <div className="action-bar-container">
        <div className="action-bar-inner">
          <button className="action-btn" disabled={loading} onClick={() => handleModularAction('explain')}>
            <BookOpen size={16} /> Explain Code
          </button>
          <button className="action-btn" disabled={loading} onClick={() => handleModularAction('improve')}>
            <Bug size={16} /> Bug Fix
          </button>
          <button className="action-btn" disabled={loading} onClick={() => handleModularAction('optimize')}>
            <Settings size={16} /> Optimize Code
          </button>
          <button className="action-btn" disabled={loading} onClick={() => handleModularAction('test')}>
            <CheckSquare size={16} /> Generate Tests
          </button>
          <button className="action-btn" disabled={loading} onClick={() => handleModularAction('complexity')}>
            <          Clock size={16} /> Complexity
          </button>

          <div className="debug-all-wrapper">
            <button
              className="debug-all-btn"
              onClick={() => handleModularAction("learning")}
              disabled={loading}
            >
              <BookOpen size={18} /> Learning Path
            </button>
            <div className="debug-micro-label">Personalized roadmap</div>
          </div>

        </div>
      </div>

      {/* Scrollable Feature Sections */}
      <div className="cinematic-scroll-overlay"></div>
      <section className="scroll-features">
        <div className="feature-section modern">
          <h2 className="section-title">Why Ojas Code Mentor</h2>
          <div className="features-grid">
            <div className="feature-card glass">
              <Bug size={24} className="feature-icon" />
              <h3>Intelligent Debugging</h3>
              <p>Finds deep context bugs simple linters miss.</p>
            </div>
            <div className="feature-card glass">
              <Clock size={24} className="feature-icon" />
              <h3>Complexity Analysis</h3>
              <p>Instant Big O time and space feedback.</p>
            </div>
            <div className="feature-card glass">
              <ShieldCheck size={24} className="feature-icon" />
              <h3>Edge Case Detection</h3>
              <p>Spots broken limits before production.</p>
            </div>
            <div className="feature-card glass">
              <Activity size={24} className="feature-icon" />
              <h3>Interview Insights</h3>
              <p>Learn structured problem-solving patterns.</p>
            </div>
          </div>
        </div>

        <div className="feature-section modern">
          <h2 className="section-title">How It Works</h2>
          <div className="flow-steps">
            <div className="flow-step">
              <TerminalSquare size={28} />
              <span>Paste</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <Activity size={28} />
              <span>Analyze</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <Code size={28} />
              <span>Fix</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <BookOpen size={28} />
              <span>Learn</span>
            </div>
          </div>
        </div>

        <div className="feature-section modern">
          <h2 className="section-title">Supported Languages</h2>
          <div className="lang-chips">
            <span className="lang-chip">Python</span>
            <span className="lang-chip">JavaScript</span>
            <span className="lang-chip">C++</span>
            <span className="lang-chip">Java</span>
            <span className="lang-chip">C</span>
          </div>
        </div>

        <div className="feature-section modern">
          <h2 className="section-title">About the Creators</h2>
          <div className="creators-grid">
            <div className="creator-card glass">
              <h3 title="Libraries: React, Lucide, WebGL, CSS Variables" className="creator-name">Mihir Kumar</h3>
              <p className="creator-role">Frontend Coder</p>
              <div className="creator-social">
                <Instagram size={16} />
                <span>@ron.ified</span>
              </div>
            </div>
            <div className="creator-card glass">
              <h3 title="Libraries: Llama3, Langchain, Prompt Engineering" className="creator-name">K. Rohan</h3>
              <p className="creator-role">LLM Expert</p>
              <div className="creator-social">
                <AtSign size={16} />
                <span>@k_rohan</span>
              </div>
            </div>
            <div className="creator-card glass">
              <h3 title="Libraries: Python, FastAPI, Context Trees, WebSockets" className="creator-name">G. Arjun</h3>
              <p className="creator-role">Backend Coder</p>
              <div className="creator-social">
                <Instagram size={16} />
                <span>@shawn__._</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
