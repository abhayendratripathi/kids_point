import React from 'react';
const COLORS = [
  { bar:'linear-gradient(90deg,#6C5CE7,#a29bfe)', bg:'#f0eeff' },
  { bar:'linear-gradient(90deg,#00b894,#55efc4)', bg:'#e0f7f1' },
  { bar:'linear-gradient(90deg,#fd79a8,#fdcb6e)', bg:'#fff0f8' },
  { bar:'linear-gradient(90deg,#0984e3,#74b9ff)', bg:'#eef4ff' },
];
function age(dob) { return Math.floor((Date.now()-new Date(dob))/(1000*60*60*24*365.25)); }
export default function KidCard({ kid, onClick }) {
  const c   = COLORS[(kid.color_idx ?? 0) % 4];
  const emo = kid.gender==='girl' ? '👧' : '🧒';
  const pts = kid.points ?? 0;
  const ptsBg = pts>0 ? 'linear-gradient(135deg,#00b894,#55efc4)'
               :pts<0 ? 'linear-gradient(135deg,#e17055,#fab1a0)'
               :        'linear-gradient(135deg,#6C5CE7,#a29bfe)';
  return (
    <div className="kid-card" onClick={onClick}>
      <div className="kc-bar"  style={{ background:c.bar }} />
      <div className="kc-av"  style={{ background:c.bg }}>{emo}</div>
      <div className="kc-name">{kid.name}</div>
      <div className="kc-age">{age(kid.dob)} yrs</div>
      <div className="kc-pts" style={{ background:ptsBg }}>⭐ {pts>0?'+':''}{pts}</div>
    </div>
  );
}
