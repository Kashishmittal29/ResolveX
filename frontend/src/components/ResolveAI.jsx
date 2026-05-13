import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ── Color maps ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  ELECTRICAL: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  PLUMBING:   { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400' },
  HVAC:       { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-400' },
  IT_SUPPORT: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-400' },
  SECURITY:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400' },
  OTHER:      { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400' },
};

const PRIORITY_COLORS = {
  LOW:      { bg: 'bg-green-100',  text: 'text-green-800' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-800' },
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-800' },
};

const STATUS_COLORS = {
  PENDING:     'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED:    'bg-green-100 text-green-800',
  ESCALATED:   'bg-red-100 text-red-800',
};

const FAQ_CATEGORIES = ['ALL', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'IT_SUPPORT', 'SECURITY', 'OTHER'];

// ── Shimmer skeleton ──────────────────────────────────────────────────────────
function ShimmerBar({ className = '' }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'rai-shimmer 1.4s infinite linear',
      }}
    />
  );
}

function AnalyzeSkeleton() {
  return (
    <div className="space-y-3 mt-3">
      <ShimmerBar className="h-6 w-3/4" />
      <ShimmerBar className="h-4 w-full" />
      <ShimmerBar className="h-4 w-5/6" />
      <div className="flex gap-2 mt-2">
        <ShimmerBar className="h-6 w-24" />
        <ShimmerBar className="h-6 w-16" />
      </div>
      <ShimmerBar className="h-2 w-full rounded-full" />
      <ShimmerBar className="h-10 w-full" />
    </div>
  );
}

// ── Confidence progress bar ───────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const color =
    value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Confidence</span>
        <span className="text-xs font-semibold text-gray-700">{value}% confident</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── Main ResolveAI component ──────────────────────────────────────────────────
export default function ResolveAI({ onPrefill }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('analyze');
  const panelRef = useRef(null);

  // Analyze tab
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [similarOpen, setSimilarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FAQ tab (cached)
  const [faqs, setFaqs] = useState(null);
  const [faqFilter, setFaqFilter] = useState('ALL');
  const [faqOpenMap, setFaqOpenMap] = useState({});

  // Stats tab (cached)
  const [stats, setStats] = useState(null);

  // Only students see the assistant
  if (!user || user.role !== 'student') return null;

  // ── Outside-click detection ───────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // ── Lazy-load FAQ / stats when tab first opens ────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (tab === 'faq' && faqs === null) {
      api
        .get('/resolveai/faq')
        .then((r) => setFaqs(r.data.faqs))
        .catch(() => toast.error('Failed to load FAQs'));
    }
    if (tab === 'stats' && stats === null) {
      api
        .get('/resolveai/my-stats')
        .then((r) => setStats(r.data.stats))
        .catch(() => toast.error('Failed to load your stats'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Analyze ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error('Please describe your issue first');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    setSimilarOpen(false);
    try {
      const res = await api.post('/resolveai/analyze', { description });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed — please try again');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUsePrefill = () => {
    if (!result) return;
    onPrefill?.({
      title: result.classification.suggestedTitle,
      description,
      category: result.classification.category,
      priority: result.classification.priority,
    });
    setOpen(false);
    toast.success('Details pre-filled in the complaint form!');
  };

  const handleQuickSubmit = async () => {
    if (!result) return;
    const loc = window.prompt(
      'Enter the location of the issue (e.g. Block A, Room 205):'
    );
    if (!loc || !loc.trim()) {
      toast.error('Location is required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/resolveai/quick-submit', {
        title: result.classification.suggestedTitle,
        description,
        category: result.classification.category,
        priority: result.classification.priority,
        location: loc.trim(),
      });
      toast.success('Complaint submitted! 🎉');
      setDescription('');
      setResult(null);
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quick submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── FAQ helpers ───────────────────────────────────────────────────────────
  const filteredFaqs = faqs
    ? faqFilter === 'ALL'
      ? faqs
      : faqs.filter((f) => f.category === faqFilter)
    : [];

  const toggleFaq = (id) =>
    setFaqOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Stats helpers ─────────────────────────────────────────────────────────
  function getMotivation(s) {
    if (!s) return null;
    if (s.resolved > 5)
      return { msg: "You're a power user! 🏆", cls: 'text-indigo-700 bg-indigo-50' };
    if (s.escalated > 0)
      return { msg: 'You have escalated complaints. Check them! ⚠', cls: 'text-orange-700 bg-orange-50' };
    return { msg: 'Keep submitting issues to improve campus life 💪', cls: 'text-green-700 bg-green-50' };
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes rai-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes rai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.45); }
          50%       { box-shadow: 0 0 0 11px rgba(99,102,241,0); }
        }
        .rai-idle-pulse { animation: rai-pulse 2.2s ease-in-out infinite; }
        .rai-accordion { overflow: hidden; transition: max-height .3s ease, opacity .25s ease; }
        .rai-accordion.closed { max-height: 0; opacity: 0; }
        .rai-accordion.open   { max-height: 600px; opacity: 1; }
      `}</style>

      {/* ── Floating trigger button ── */}
      <button
        id="resolveai-toggle"
        onClick={() => setOpen((o) => !o)}
        title="ResolveAI — Smart Complaint Assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
          flex items-center justify-center
          bg-gradient-to-br from-indigo-500 to-purple-600
          shadow-lg shadow-indigo-500/40
          hover:scale-110 active:scale-95 transition-transform duration-200
          ${!open ? 'rai-idle-pulse' : ''}`}
      >
        {/* Sparkle / star icon */}
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
          <path d="M19 2l.94 2.82L22.76 6l-2.82.94L19 9.76l-.94-2.82L15.24 6l2.82-.94z" opacity=".6" />
          <path d="M5 17l.63 1.88L7.5 19.5l-1.88.62L5 22l-.62-1.88L2.5 19.5l1.88-.62z" opacity=".4" />
        </svg>
      </button>

      {/* ── Floating panel ── */}
      {open && (
        <div
          ref={panelRef}
          id="resolveai-panel"
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px]
            flex flex-col rounded-2xl shadow-2xl overflow-hidden
            border border-gray-100 bg-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0
            bg-gradient-to-r from-indigo-600 to-purple-600">
            <div>
              <p className="text-white font-bold text-sm leading-tight">✦ ResolveAI</p>
              <p className="text-indigo-200 text-xs">Smart Complaint Assistant</p>
            </div>
            <button
              id="resolveai-close"
              onClick={() => setOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-100 flex-shrink-0 bg-white">
            {[
              { id: 'analyze', label: '✦ Analyze' },
              { id: 'faq',     label: '💬 FAQ' },
              { id: 'stats',   label: '📊 My Stats' },
            ].map((t) => (
              <button
                key={t.id}
                id={`rai-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative
                  ${tab === t.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">

            {/* ═══ TAB: ANALYZE ═══ */}
            {tab === 'analyze' && (
              <div className="p-4 space-y-3">
                <textarea
                  id="rai-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in plain English…"
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none
                    text-gray-700 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <button
                  id="rai-analyze-btn"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    hover:from-indigo-600 hover:to-purple-700
                    disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {analyzing ? 'Analyzing…' : '✦ Analyze with AI'}
                </button>

                {analyzing && <AnalyzeSkeleton />}

                {!analyzing && result && (() => {
                  const cc = CATEGORY_COLORS[result.classification.category] || CATEGORY_COLORS.OTHER;
                  const pc = PRIORITY_COLORS[result.classification.priority] || PRIORITY_COLORS.MEDIUM;
                  return (
                    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-3">

                      {/* Category + Priority badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cc.bg} ${cc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                          {result.classification.category.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pc.bg} ${pc.text}`}>
                          {result.classification.priority}
                        </span>
                      </div>

                      {/* Suggested title */}
                      <p className="text-sm font-bold text-gray-800">
                        {result.classification.suggestedTitle}
                      </p>

                      {/* AI reasoning */}
                      <p className="text-xs text-gray-500 italic">
                        {result.classification.reasoning}
                      </p>

                      {/* Confidence bar */}
                      <ConfidenceBar value={result.classification.confidence} />

                      {/* Predicted resolution */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600
                        bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                        <span>⏱</span>
                        <span>
                          Usually resolved in{' '}
                          <strong>~{result.predictedResolutionHours} hrs</strong>
                        </span>
                      </div>

                      {/* Similar open complaints */}
                      {result.similarComplaints?.length > 0 && (
                        <div>
                          <button
                            onClick={() => setSimilarOpen((o) => !o)}
                            className="flex items-center gap-1.5 text-xs font-semibold
                              text-amber-700 hover:text-amber-900 transition-colors"
                          >
                            <span>⚠</span>
                            <span>
                              {result.similarComplaints.length} similar open complaint
                              {result.similarComplaints.length > 1 ? 's' : ''}
                            </span>
                            <svg
                              className={`w-3 h-3 transition-transform ${similarOpen ? 'rotate-180' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          <div className={`rai-accordion ${similarOpen ? 'open' : 'closed'}`}>
                            <div className="mt-2 space-y-1.5">
                              {result.similarComplaints.map((sc) => (
                                <div
                                  key={sc.id}
                                  className="flex items-center justify-between
                                    bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-800 truncate">
                                      {sc.title}
                                    </p>
                                    <span className={`mt-0.5 inline-block text-xs px-1.5 py-0.5
                                      rounded-full font-medium ${STATUS_COLORS[sc.status] || 'bg-gray-100 text-gray-600'}`}>
                                      {sc.status}
                                    </span>
                                  </div>
                                  <a
                                    href={`/complaint/${sc.id}`}
                                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-800
                                      font-medium flex-shrink-0"
                                  >
                                    View →
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          id="rai-use-details-btn"
                          onClick={handleUsePrefill}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold
                            text-indigo-700 bg-indigo-50 border border-indigo-200
                            hover:bg-indigo-100 transition-colors"
                        >
                          Use These Details →
                        </button>
                        <button
                          id="rai-quick-submit-btn"
                          onClick={handleQuickSubmit}
                          disabled={submitting}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white
                            bg-gradient-to-r from-indigo-500 to-purple-600
                            hover:from-indigo-600 hover:to-purple-700
                            disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {submitting ? 'Submitting…' : '⚡ Quick Submit'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ═══ TAB: FAQ ═══ */}
            {tab === 'faq' && (
              <div className="p-4 space-y-3">
                {/* Category filter pills */}
                <div className="flex flex-wrap gap-1.5">
                  {FAQ_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFaqFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors
                        ${faqFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {cat === 'ALL' ? 'All' : cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {faqs === null ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <ShimmerBar key={i} className="h-12" />
                    ))}
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    No FAQs in this category.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between
                            px-3 py-2.5 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xs font-semibold text-gray-800 pr-2">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform
                              ${faqOpenMap[faq.id] ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className={`rai-accordion ${faqOpenMap[faq.id] ? 'open' : 'closed'}`}>
                          <p className="px-3 pb-3 text-xs text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB: MY STATS ═══ */}
            {tab === 'stats' && (
              <div className="p-4 space-y-3">
                {stats === null ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <ShimmerBar key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* 2×2 stat grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Total',     value: stats.total,     grad: 'from-indigo-500 to-purple-500' },
                        { label: 'Resolved',  value: stats.resolved,  grad: 'from-green-500 to-emerald-500' },
                        { label: 'Pending',   value: stats.pending,   grad: 'from-yellow-400 to-amber-500' },
                        { label: 'Escalated', value: stats.escalated, grad: 'from-red-500 to-rose-500' },
                      ].map((card) => (
                        <div
                          key={card.label}
                          className={`bg-gradient-to-br ${card.grad} rounded-xl p-3 text-white`}
                        >
                          <p className="text-2xl font-bold">{card.value}</p>
                          <p className="text-xs font-medium opacity-80 mt-0.5">{card.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Average resolution time */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-indigo-600 font-medium">Average resolution time</p>
                      <p className="text-base font-bold text-indigo-800 mt-0.5">
                        {stats.avgResolutionHours !== null
                          ? `${stats.avgResolutionHours} hours`
                          : 'No resolved complaints yet'}
                      </p>
                    </div>

                    {/* Motivational message */}
                    {(() => {
                      const m = getMotivation(stats);
                      return m ? (
                        <div className={`${m.cls} rounded-xl px-3 py-2.5 text-xs font-semibold`}>
                          {m.msg}
                        </div>
                      ) : null;
                    })()}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0 bg-white">
            <p className="text-center text-xs text-gray-400">
              Powered by Claude · ResolveX
            </p>
          </div>
        </div>
      )}
    </>
  );
}
