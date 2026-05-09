'use client';

import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react';

interface HistoryItem {
  id: string;
  url: string;
  timestamp: string;
}

interface HistoryResponse {
  history: HistoryItem[];
  currentUrl: string;
  currentIndex: number;
  error?: string;
}

// Prefer same-origin requests via Next.js rewrite proxy (see `next.config.mjs`).
// Set NEXT_PUBLIC_API_BASE_URL to override (e.g. deployed backend URL).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function HistoryManager() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch initial history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const applyHistoryData = (data: HistoryResponse) => {
    setHistory(data.history);
    setCurrentUrl(data.currentUrl);
    setCurrentIndex(data.currentIndex);
    setInputUrl(data.currentUrl);
    setErrorMessage(data.error ?? '');
  };

  const sendHistoryRequest = async (path: string, init?: RequestInit) => {
    setRequestInFlight(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, init);
      const data: HistoryResponse = await response.json();
      applyHistoryData(data);
    } catch (error) {
      console.error(`Error calling ${path}:`, error);
      setErrorMessage('Could not reach the server. Please check backend status.');
    } finally {
      setRequestInFlight(false);
    }
  };

  const normalizeUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      await sendHistoryRequest('/api/history/current');
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (currentIndex <= 0) return;
    await sendHistoryRequest('/api/history/back', { method: 'POST' });
  };

  const handleForward = async () => {
    if (currentIndex >= history.length - 1) return;
    await sendHistoryRequest('/api/history/front', { method: 'POST' });
  };

  const handleVisit = async (e?: FormEvent | KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    const normalizedUrl = normalizeUrl(inputUrl);
    if (!normalizedUrl) return;

    await sendHistoryRequest('/api/history/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalizedUrl }),
    });
  };

  const handleDelete = async (id: string) => {
    await sendHistoryRequest('/api/history/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVisit(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Top Bar */}
      <div className="w-full bg-[#0f0f0f] border-b border-[#2a2a2a] p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={requestInFlight || currentIndex <= 0}
            className="px-3 py-2 hover:bg-[#1a1a1a] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Back"
            title="Back"
          >
            ←
          </button>

          {/* Forward Button */}
          <button
            onClick={handleForward}
            disabled={requestInFlight || currentIndex >= history.length - 1}
            className="px-3 py-2 hover:bg-[#1a1a1a] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Forward"
            title="Forward"
          >
            →
          </button>

          {/* URL Input */}
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter URL..."
            disabled={requestInFlight}
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white placeholder-[#666] focus:outline-none focus:border-[#444] transition-colors"
          />

          {/* Go Button */}
          <button
            onClick={() => handleVisit()}
            disabled={requestInFlight || !inputUrl.trim()}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Go"
          >
            →
          </button>
        </div>
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}
      </div>

      {/* History List */}
      <div className="max-w-4xl mx-auto p-4">
        {history.length === 0 ? (
          <div className="text-center text-[#666] py-12">
            <div className="text-lg text-white/90">Enter a URL to get started</div>
            <div className="mt-2 text-sm text-[#666]">Example: `google.com` or `https://example.com`</div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded border transition-colors ${
                  index === currentIndex
                    ? 'bg-[#1f1f1f] border-[#3a3a3a]'
                    : 'bg-[#0f0f0f] border-[#2a2a2a] hover:bg-[#151515]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{item.url}</div>
                  <div className="text-xs text-[#666] mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={requestInFlight}
                  className="ml-4 px-3 py-2 hover:bg-[#2a2a2a] rounded transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Delete"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
