import { useEffect, useMemo, useRef, useState } from 'react'

export default function SearchableSelect({ label, value, options = [], placeholder, required = false, disabled = false, isRtl = false, onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedLabel = value || ''
  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return options
    return options.filter((option) => option.toLocaleLowerCase().includes(needle))
  }, [options, query])

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function choose(option) {
    onChange(option)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className={`searchable-select ${isRtl ? 'rtl' : 'ltr'} ${disabled ? 'is-disabled' : ''}`} ref={rootRef}>
      <label>{label}{required ? ' *' : ''}</label>
      <button
        type="button"
        className="searchable-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedLabel ? '' : 'placeholder'}>{selectedLabel || placeholder}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="searchable-select-menu" role="listbox" aria-label={label}>
          <input
            autoFocus
            className="searchable-select-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isRtl ? 'ابحث هنا...' : 'Search...'}
            aria-label={isRtl ? `ابحث في ${label}` : `Search ${label}`}
          />
          <div className="searchable-select-options">
            {filteredOptions.length ? filteredOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                className={option === value ? 'selected' : ''}
                key={option}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            )) : <p className="searchable-select-empty">{isRtl ? 'لا توجد نتائج' : 'No matches found'}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
