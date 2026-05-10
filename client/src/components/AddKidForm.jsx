import React, { useState } from 'react';
const BLOODS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
export default function AddKidForm({ onSubmit, onCancel }) {
  const [f, setF] = useState({ name:'',dob:'',gender:'boy',bio:'',height:'',weight:'',blood:'O+',allergies:'None',medical:'None' });
  const [busy, setBusy] = useState(false);
  const s = k => e => setF(p=>({...p,[k]:e.target.value}));
  const submit = async () => {
    if (!f.name.trim()||!f.dob) { alert('Name and date of birth are required'); return; }
    setBusy(true); try { await onSubmit(f); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="form-group"><label>Full Name *</label><input className="form-control" value={f.name} onChange={s('name')} placeholder="e.g. Aarav Sharma"/></div>
      <div className="form-row">
        <div className="form-group"><label>Date of Birth *</label><input className="form-control" type="date" value={f.dob} onChange={s('dob')}/></div>
        <div className="form-group"><label>Gender</label>
          <select className="form-control" value={f.gender} onChange={s('gender')}><option value="boy">Boy</option><option value="girl">Girl</option></select>
        </div>
      </div>
      <div className="form-group"><label>Short Bio</label><textarea className="form-control" value={f.bio} onChange={s('bio')} placeholder="Tell us about this kid…" rows={2}/></div>
      <p style={{ fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10 }}>Health Parameters</p>
      <div className="form-row-3">
        <div className="form-group"><label>Height (cm)</label><input className="form-control" type="number" value={f.height} onChange={s('height')} placeholder="120"/></div>
        <div className="form-group"><label>Weight (kg)</label><input className="form-control" type="number" value={f.weight} onChange={s('weight')} placeholder="25"/></div>
        <div className="form-group"><label>Blood</label>
          <select className="form-control" value={f.blood} onChange={s('blood')}>{BLOODS.map(b=><option key={b}>{b}</option>)}</select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Allergies</label><input className="form-control" value={f.allergies} onChange={s('allergies')} placeholder="None"/></div>
        <div className="form-group"><label>Medical Notes</label><input className="form-control" value={f.medical} onChange={s('medical')} placeholder="Any conditions"/></div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy?'Adding…':'Add Kid ⭐'}</button>
      </div>
    </>
  );
}
