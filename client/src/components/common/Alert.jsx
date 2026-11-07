import React from 'react';

const styles = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const icons = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function Alert({ message, type = 'error', onDismiss }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-2 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}
      role="alert"
    >
      <span className="mt-0.5">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
