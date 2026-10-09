import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', prefix, className = '', ...props },
  ref,
) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;

  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-500">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={`field ${prefix ? 'pl-9' : ''} ${isPassword ? 'pr-11' : ''}
            ${error ? 'ring-2 ring-state-danger/40' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 hover:bg-white"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs text-state-danger">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>
      )}
    </label>
  );
});

export default Input;
