import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { kidsAPI, activitiesAPI, historyAPI } from '../utils/api';
import KidCard      from '../components/KidCard';
import Modal        from '../components/Modal';
import AddKidForm   from '../components/AddKidForm';
import HistoryItem  from '../components/HistoryItem';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kids,     setKids]     = useState([]);
  const [acts,     setActs]     = useState([]);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [selKid,   setSelKid]   = useState('');
  const [selAct,   setSelAct]   = useState('');
  const [note,     setNote]     = useState('');
  const [busy,     setBusy]     = useState(false);

  const load = useCallback(async () => {
    try {
      const [kr, ar, hr] = await Promise.all([
        kidsAPI.getAll(), activitiesAPI.getAll(), historyAPI.getAll({ limit:10 }),
      ]);
      setKids(kr.data); setActs(ar.data); setHistory(hr.data);
      if (kr.data.length && !selKid) setSelKid(kr.data[0].id);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleAddKid = async data => {
    try {
      const { data: kid } = await kidsAPI.create(data);
      setKids(p => [...p, kid]); setSelKid(kid.id);
      setShowAdd(false); toast.success(`${kid.name} added! 🎉`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAssign = async () => {
    if (!selKid) { toast.error('Select a kid'); return; }
    if (!selAct) { toast.error('Select an activity'); return; }
    setBusy(true);
    try {
      const { data } = await historyAPI.assign({ kidId:selKid, activityId:selAct, note });
      setKids(p => p.map(k => k.id===selKid ? { ...k, points:data.kidPoints } : k));
      setHistory(p => [data.entry, ...p.slice(0,9)]);
      setNote(''); setSelAct('');
      const kid = kids.find(k=>k.id===selKid);
      const pts = data.entry.points;
      toast.success(`${pts>0?'+':''}${pts} pts for ${kid?.name}! ${pts>0?'🌟':'📉'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/><p>Loading…</p></div>;

  const posActs = acts.filter(a=>a.type==='positive');
  const negActs = acts.filter(a=>a.type==='negative');

  return (
    <div>
      {/* Kids Grid */}
      <div className="page-header">
        <div><h1 className="page-title">👨‍👩‍👧‍👦 Your Kids</h1><p className="page-sub">Tap a card to view profile</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>+ Add Kid</button>
      </div>

      <div className="kids-grid">
        {kids.map(kid => <KidCard key={kid.id} kid={kid} onClick={()=>navigate(`/kids/${kid.id}`)}/>)}
        <div className="add-kid-card" onClick={()=>setShowAdd(true)}>
          <span className="ai">＋</span><span style={{ fontSize:13,fontWeight:700 }}>Add a Kid</span>
        </div>
      </div>

      {/* Quick Assign */}
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize:17 }}>✦ Assign Points</h2>
      </div>
      <div className="card" style={{ marginBottom:28 }}>
        {kids.length > 0 && (
          <div className="form-group">
            <label>Select Kid</label>
            <div className="kid-sel-grid">
              {kids.map(k => (
                <button key={k.id} className={`kid-sel-btn${selKid===k.id?' sel':''}`} onClick={()=>setSelKid(k.id)}>
                  {k.gender==='girl'?'👧':'🧒'} {k.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="assign-grid">
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Activity</label>
            <select className="form-control" value={selAct} onChange={e=>setSelAct(e.target.value)}>
              <option value="">— Choose activity —</option>
              {posActs.length>0 && <optgroup label="✅ Positive">{posActs.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name} (+{a.points})</option>)}</optgroup>}
              {negActs.length>0 && <optgroup label="❌ Negative">{negActs.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name} (-{a.points})</option>)}</optgroup>}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Note (optional)</label>
            <input className="form-control" value={note} onChange={e=>setNote(e.target.value)} placeholder="Great job today!"/>
          </div>
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop:14 }}
          onClick={handleAssign} disabled={busy||!selKid||!selAct}>
          {busy ? 'Assigning…' : '⭐ Assign Points'}
        </button>
      </div>

      {/* Recent History */}
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize:17 }}>📜 Recent Activity</h2>
      </div>
      {history.length===0
        ? <div className="empty-state"><div className="ei">📋</div><p>No activity yet. Start assigning points!</p></div>
        : <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {history.map(h=><HistoryItem key={h.id} item={h} kids={kids}/>)}
          </div>
      }

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="👶 Add New Kid">
        <AddKidForm onSubmit={handleAddKid} onCancel={()=>setShowAdd(false)}/>
      </Modal>
    </div>
  );
}
