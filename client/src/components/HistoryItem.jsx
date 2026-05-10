import React from 'react';
const AVTS = { boy:'🧒', girl:'👧' };
function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN',{ day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' });
}
export default function HistoryItem({ item, kids=[], showUndo, onUndo }) {
  const kid      = kids.find(k=>k.id===item.kid_id);
  const emo      = kid ? (AVTS[kid.gender]||'🧒') : '👦';
  const border   = item.type==='positive'?'var(--success)':item.type==='negative'?'var(--danger)':'var(--primary)';
  const ptsLabel = item.points>0 ? `+${item.points}` : `${item.points}`;
  const ptsColor = item.points>=0 ? 'var(--success)' : 'var(--danger)';
  const badge    = item.type==='positive'?'badge-success':item.type==='negative'?'badge-danger':'badge-primary';
  const typeLabel= item.type==='manual'?'Manual':item.type==='positive'?'Positive':'Negative';
  return (
    <div className="hist-item" style={{ borderLeftColor:border }}>
      <span style={{ fontSize:22, flexShrink:0 }}>{emo}</span>
      <div className="hist-info">
        <div className="hist-name">
          {kid && <span style={{ color:'var(--muted)',fontWeight:600 }}>{kid.name} — </span>}
          {item.name}
          {' '}<span className={`badge ${badge}`} style={{ fontSize:10,padding:'2px 6px' }}>{typeLabel}</span>
        </div>
        {item.note && <div className="hist-meta">💬 {item.note}</div>}
        <div className="hist-meta">{fmt(item.created_at)}</div>
      </div>
      <div className="hist-pts" style={{ color:ptsColor }}>{ptsLabel}</div>
      {showUndo && <button className="btn btn-ghost btn-xs btn-icon" onClick={onUndo} title="Undo" style={{ marginLeft:4 }}>↩</button>}
    </div>
  );
}
