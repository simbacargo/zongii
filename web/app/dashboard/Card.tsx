import React from 'react';

export function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8edf3',
      borderRadius: 14,
      padding: '20px 22px',
      ...style,
    }}>
      {title && (
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: '#0f172a',
          margin: '0 0 16px', textTransform: 'none', letterSpacing: 0,
        }}>{title}</h3>
      )}
      {children}
    </div>
  );
}

export function Skeleton({ height = 200, style = {} }) {
  return (
    <div style={{
      height,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf3 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 8,
      ...style,
    }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div style={{
      padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 13,
      border: '1px dashed #e2e8f0', borderRadius: 8,
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>⚠</div>
      <div>{message || 'Failed to load data'}</div>
    </div>
  );
}
