import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { activitiesAPI } from '../utils/api';
import Modal from '../components/Modal';

export default function ActivitiesPage() {
  const [acts,    setActs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setAdd]     = useState(false);
  const [form,    setForm]    = useState({ name:'',description:'',icon:'',type:'positive',points:'' });
  const [busy,    setBusy]    = useState(false);
  const s = k => e => setForm(p=>({...p,[k]:e.target.value}));

  useEffect(() => {
    activitiesAPI.getAll()
      .then(r=>setActs(r.data))
      .catch(()=>toast.error('Failed to load'))
      .finally(()=>setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name||!form.points) { toast.error('Name and points required'); return; }
    setBusy(true);
    try {
      const { data } = await activitiesAPI.create({ ...form, icon:form.icon||'✦', points:parseInt(form.points) });
      setActs(p=>[...p,data]); setAdd(false);
      setForm({ name:'',description:'',icon:'',type:'positive',points:'' });
      toast.success('Activity added!');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };

  const handleDelete = async (id,name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await activitiesAPI.delete(id); setActs(p=>p.filter(a=>a.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const ActCard = ({ act }) => (
    <div className="act-card">
      <div className="act-icon" style={{ background:act.type==='positive'?'var(--success-bg)':'var(--danger-bg)' }}>{act.icon}</div>
      <div className="act-info">
        <div className="act-name">{act.name}</div>
        {act.description && <div className="act-desc">{act.description}</div>}
      </div>
      <div className="act-pts" style={{ color:act.type==='positive'?'var(--success)':'var(--danger)', background:act.type==='positive'?'var(--success-bg)':'var(--danger-bg)' }}>
        {act.type==='positive'?'+':'−'}{act.points}
      </div>
      <button className="btn btn-danger btn-xs btn-icon" onClick={()=>handleDelete(act.id,act.name)}>✕</button>
    </div>
  );

  const pos = acts.filter(a=>a.type==='positive');
  const neg = acts.filter(a=>a.type==='negative');

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">📋 Activity Rules</h1><p className="page-sub">Define what earns or loses points</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setAdd(true)}>+ Add</button>
      </div>

      <div className="act-cols">
        <div>
          <div style={{ fontSize:14,fontWeight:800,color:'var(--success)',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
            ✅ Positive <span className="badge badge-success" style={{ fontSize:11 }}>{pos.length}</span>
          </div>
          {pos.length===0 ? <div className="empty-state" style={{ padding:20 }}><p>No positive activities yet</p></div>
           : <div style={{ display:'flex',flexDirection:'column',gap:9 }}>{pos.map(a=><ActCard key={a.id} act={a}/>)}</div>}
        </div>
        <div>
          <div style={{ fontSize:14,fontWeight:800,color:'var(--danger)',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
            ❌ Negative <span className="badge badge-danger" style={{ fontSize:11 }}>{neg.length}</span>
          </div>
          {neg.length===0 ? <div className="empty-state" style={{ padding:20 }}><p>No negative activities yet</p></div>
           : <div style={{ display:'flex',flexDirection:'column',gap:9 }}>{neg.map(a=><ActCard key={a.id} act={a}/>)}</div>}
        </div>
      </div>

      <Modal open={showAdd} onClose={()=>setAdd(false)} title="📋 Add Activity">
        <div className="form-group"><label>Name *</label><input className="form-control" value={form.name} onChange={s('name')} placeholder="e.g. Complete Homework"/></div>
        <div className="form-group"><label>Description</label><input className="form-control" value={form.description} onChange={s('description')} placeholder="Brief description"/></div>
        <div className="form-row">
          <div className="form-group"><label>Icon (emoji)</label><input className="form-control" value={form.icon} onChange={s('icon')} placeholder="📚" maxLength={2}/></div>
          <div className="form-group"><label>Points *</label><input className="form-control" type="number" min="1" max="20" value={form.points} onChange={s('points')} placeholder="3"/></div>
        </div>
        <div className="form-group"><label>Type</label>
          <select className="form-control" value={form.type} onChange={s('type')}>
            <option value="positive">✅ Positive</option>
            <option value="negative">❌ Negative</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={()=>setAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={busy}>{busy?'…':'Add Activity'}</button>
        </div>
      </Modal>
    </div>
  );
}
