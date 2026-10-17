import React from 'react';

export const Table = ({ columns, data, loading, emptyMessage = 'Không có dữ liệu' }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Đang tải dữ liệu...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
        <p style={{ fontSize: '0.95rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ textAlign: col.align || 'left', width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
