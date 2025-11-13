'use client';

import { useState } from 'react';

interface Action {
  owner: string;
  task: string;
}

interface ActionsResponse {
  actions: Action[];
}

type ViewMode = 'table' | 'list';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setActions([]);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscript(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTranscript('');
    setActions([]);
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) {
      setError('Please upload a transcript file first');
      return;
    }

    setLoading(true);
    setError(null);
    setActions([]);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze transcript');
      }

      const data: ActionsResponse = await response.json();
      setActions(data.actions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Meeting Transcript Analyzer</h1>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            className="file-input"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileChange}
          />
          <label htmlFor="file-input" className="file-input-label">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="file-input-label-text">
              {file ? 'File Selected' : 'Click to upload transcript'}
            </span>
            <span className="file-input-label-hint">
              Supports .txt, .md, .doc, .docx files
            </span>
          </label>
        </div>

        {file && (
          <div className="selected-file">
            <span className="file-name">{file.name}</span>
            <button className="remove-file" onClick={handleRemoveFile}>
              Remove
            </button>
          </div>
        )}
      </div>

      <button
        className="analyze-button"
        onClick={handleAnalyze}
        disabled={!transcript || loading}
      >
        {loading ? (
          <span className="loading">
            <div className="spinner"></div>
            Analyzing transcript...
          </span>
        ) : (
          'Analyze Transcript'
        )}
      </button>

      {error && <div className="error">{error}</div>}

      {actions.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2 className="results-title">Action Items ({actions.length})</h2>
            <div className="view-toggle">
              <button
                className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
              <button
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <table className="actions-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Task</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action, index) => (
                  <tr key={index}>
                    <td>{action.owner || 'Unassigned'}</td>
                    <td>{action.task}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="actions-list">
              {actions.map((action, index) => (
                <div key={index} className="action-item">
                  <div className="action-owner">
                    {action.owner || 'Unassigned'}
                  </div>
                  <div className="action-task">{action.task}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && actions.length === 0 && transcript && (
        <div className="empty-state">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>Click &quot;Analyze Transcript&quot; to extract action items</p>
        </div>
      )}
    </div>
  );
}


