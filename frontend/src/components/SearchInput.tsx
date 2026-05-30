import { useState, useCallback, useRef, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchInput({ onSearch, loading }: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(v);
    }, 400);
  }, [onSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputWrap}>
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search products across Amazon, Flipkart, Meesho, Croma, eBay..."
          style={styles.input}
          autoFocus
        />
        {loading && <span style={styles.spinner} />}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    width: '20px',
    height: '20px',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#111827',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  spinner: {
    position: 'absolute',
    right: '16px',
    width: '20px',
    height: '20px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#111827',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};
