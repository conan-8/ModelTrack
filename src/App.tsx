import { useState, useMemo } from 'react'
import './App.css'
import data from './data/llm_registry.json'

type Model = {
  'Model Name': string | null
  'AI Lab / Organization': string | null
  'Date Released': string | null
  '# Parameters': string | null
  'Active Parameters': string | null
  'Architecture': string | null
  'Context Window': number | null
  'HLE Score': number | null
  'GPQA Diamond Score': number | null
  'SWE-bench Score': number | null
  'ARC-AGI 2 Score': number | null
  'Price Input USD / 1M Tokens': number | null
  'Price Output USD / 1M Tokens': number | null
  'Source URL': string | null
  'Notes': string | null
}

const models = data as Model[]

type SortKey =
  | 'Model Name'
  | 'AI Lab / Organization'
  | 'Date Released'
  | '# Parameters'
  | 'Architecture'
  | 'Context Window'
  | 'HLE Score'
  | 'GPQA Diamond Score'
  | 'Price Input USD / 1M Tokens'

type SortDir = 'asc' | 'desc'

const TABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'Model Name', label: 'Model' },
  { key: 'AI Lab / Organization', label: 'Lab / Org' },
  { key: 'Date Released', label: 'Released' },
  { key: '# Parameters', label: 'Parameters' },
  { key: 'Architecture', label: 'Architecture' },
  { key: 'Context Window', label: 'Context' },
  { key: 'HLE Score', label: 'HLE' },
  { key: 'GPQA Diamond Score', label: 'GPQA' },
  { key: 'Price Input USD / 1M Tokens', label: 'Price In' },
]

function formatValue(key: SortKey, value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (key === 'Price Input USD / 1M Tokens' && typeof value === 'number') {
    return `$${value.toFixed(2)}`
  }
  if (key === 'Context Window' && typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return String(value)
}

function sortModels(list: Model[], key: SortKey, dir: SortDir): Model[] {
  return [...list].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === null && bVal === null) return 0
    if (aVal === null) return dir === 'asc' ? 1 : -1
    if (bVal === null) return dir === 'asc' ? -1 : 1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dir === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    if (aStr < bStr) return dir === 'asc' ? -1 : 1
    if (aStr > bStr) return dir === 'asc' ? 1 : -1
    return 0
  })
}

function App() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('Date Released')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return models
    return models.filter((m) =>
      TABLE_COLUMNS.some((col) => {
        const val = m[col.key]
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(term)
      })
    )
  }, [search])

  const sorted = useMemo(
    () => sortModels(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  )

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="app">
      <div className="logo">
        <span className="logo-model">Model</span>
        <span className="logo-track">Track</span>
      </div>
      <section className="hero">
        <h1 className="hero-title">
          See how models <em>change</em> over time
        </h1>
        <p className="hero-subtitle">
          {models.length.toLocaleString()} models tracked across the AI landscape
        </p>
      </section>

      <section className="controls">
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search models, labs, architectures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="result-count">
          {sorted.length.toLocaleString()} result{sorted.length !== 1 ? 's' : ''}
        </div>
      </section>

      <section className="table-section">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={sortKey === col.key ? 'active' : ''}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="th-content">
                      {col.label}
                      {sortKey === col.key && (
                        <span className="sort-indicator">
                          {sortDir === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((model, i) => (
                <tr key={i}>
                  {TABLE_COLUMNS.map((col) => (
                    <td key={col.key}>
                      {col.key === 'Model Name' && model['Source URL'] ? (
                        <a
                          href={model['Source URL']}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="model-link"
                        >
                          {formatValue(col.key, model[col.key])}
                        </a>
                      ) : (
                        formatValue(col.key, model[col.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        <p>
          Data sourced from official model releases. Last updated May 2026.
        </p>
      </footer>
    </div>
  )
}

export default App
