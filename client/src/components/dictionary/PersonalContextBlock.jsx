export default function PersonalContextBlock({ contextString, loading, isConnected }) {
  if (loading) {
    return (
      <div style={{
        borderLeft: '3px solid var(--border-1)',
        paddingLeft: 14,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 12,
      }}>
        <div style={{ height: 10, width: 80, background: 'var(--border-1)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 13, width: '90%', background: 'var(--border-1)', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 13, width: '70%', background: 'var(--border-1)', borderRadius: 4 }} />
      </div>
    );
  }

  if (!isConnected || !contextString) {
    return (
      <div style={{
        borderLeft: '3px solid var(--border-1)',
        paddingLeft: 14,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
          In your situation
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
          Connect your bank account to see how this term applies to your specific finances.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderLeft: '3px solid #173124',
      paddingLeft: 14,
      paddingTop: 10,
      paddingBottom: 10,
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: '#173124', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
        In your situation
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.55 }}>
        {contextString}
      </div>
    </div>
  );
}
