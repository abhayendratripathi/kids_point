import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { kidsAPI, historyAPI } from '../utils/api';
import Modal       from '../components/Modal';
import HistoryItem from '../components/HistoryItem';

const COLORS = ['#6C5CE7','#00b894','#fd79a8','#0984e3'];
const BLOODS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const age  = dob => Math.floor((Date.now()-new Date(dob))/(1000*60*60*24*365.25));
const fmtD = iso => new Date(iso).toLocaleDateString('en-IN',{ day:'2-digit',month:'long',year:'numeric' });

export default function KidProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kid,     setKid]     = useState(null);
  const [history, setHistory] = useState([]);
  const [health,  setHealth]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('history');
  const [showMan, setShowMan] = useState(false);
  const [showHlt, setShowHlt] = useState(false);
  const [manPts,  setManPts]  = useState('');
  const [manNote, setManNote] = useState('');
  const [hForm,   setHForm]   = useState({});
  const [busy,    setBusy]    = useState(false);

  const load = useCallback(async () => {
    try {
      const [kr,hr,hhr] = await Promise.all([kidsAPI.get(id), historyAPI.getAll({kidId:id}), kidsAPI.getHealth(id)]);
      setKid(kr.data); setHistory(hr.data); setHealth(hhr.data);
      setHForm({ height:kr.data.height, weight:kr.data.weight, blood:kr.data.blood, allergies:kr.data.allergies, medical:kr.data.medical });
    } catch { toast.error('Failed to load profile'); navigate('/dashboard'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const applyManual = async () => {
    const pts = parseInt(manPts);
    if (!pts) { toast.error('Enter a valid value'); return; }
    setBusy(true);
    try {
      const { data } = await historyAPI.manual({ kidId:id, points:pts, note:manNote });
      setKid(p=>({...p, points:data.kidPoints}));
      setHistory(p=>[data.entry,...p]);
      setShowMan(false); setManPts(''); setManNote('');
      toast.success(`${pts>0?'+':''}${pts} pts applied!`);
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };

  const saveHealth = async () => {
    setBusy(true);
    try {
      const { data } = await kidsAPI.addHealth(id, hForm);
      setKid(data.kid); setHealth(p=>[data.record,...p]);
      setShowHlt(false); toast.success('Health record saved! 📏');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };

  const undoEntry = async (hid, pts) => {
    if (!window.confirm('Reverse this entry?')) return;
    try {
      await historyAPI.delete(hid);
      setKid(p=>({...p, points:p.points-pts}));
      setHistory(p=>p.filter(h=>h.id!==hid));
      toast.success('Entry reversed');
    } catch { toast.error('Failed'); }
  };

  const deleteKid = async () => {
    if (!window.confirm(`Remove ${kid.name}?`)) return;
    try { await kidsAPI.delete(id); toast.success('Removed'); navigate('/dashboard'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!kid)    return null;

  const color    = COLORS[(kid.color_idx??0)%4];
  const emoji    = kid.gender==='girl'?'👧':'🧒';
  const totalPos = history.filter(h=>h.points>0).reduce((s,h)=>s+h.points,0);
  const totalNeg = history.filter(h=>h.points<0).reduce((s,h)=>s+h.points,0);
  const goal     = 100;
  const progress = Math.min(100,Math.max(0,Math.round((kid.points/goal)*100)));

  return (
    <div>
      <button className="back-btn" onClick={()=>navigate('/dashboard')}>← Back</button>

      {/* Profile Header */}
      <div className="card" style={{ marginBottom:16 }}>
        <div className="profile-hero">
          <div className="profile-av-lg" style={{ background:`${color}22` }}>{emoji}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:22,fontWeight:900 }}>{kid.name}</h1>
            <p style={{ fontSize:13,color:'var(--muted)',margin:'4px 0 8px' }}>
              {age(kid.dob)} yrs · Born {fmtD(kid.dob)} · {kid.gender==='girl'?'Girl':'Boy'}
            </p>
            {kid.bio && <p style={{ fontSize:13.5,color:'var(--muted)',marginBottom:10 }}>{kid.bio}</p>}
            <div className="health-chips">
              {kid.height>0 && <span className="badge badge-primary">📏 {kid.height}cm</span>}
              {kid.weight>0 && <span className="badge badge-primary">⚖️ {kid.weight}kg</span>}
              {kid.blood   && <span className="badge badge-primary">🩸 {kid.blood}</span>}
              {kid.allergies&&kid.allergies!=='None' && <span className="badge badge-warning">⚠️ {kid.allergies}</span>}
              {kid.medical &&kid.medical!=='None'    && <span className="badge badge-danger">💊 {kid.medical}</span>}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary btn-sm" onClick={()=>setShowMan(true)}>✦ Adjust Points</button>
            <button className="btn btn-outline btn-sm" onClick={()=>setShowHlt(true)}>📏 Update Health</button>
            <button className="btn btn-danger  btn-sm" onClick={deleteKid}>🗑 Remove</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label:'Total Points', val:`${kid.points>0?'+':''}${kid.points}`, c:color },
          { label:'Earned',       val:`+${totalPos}`,                        c:'var(--success)' },
          { label:'Deducted',     val:totalNeg,                              c:'var(--danger)' },
          { label:'Activities',   val:history.length,                        c:'var(--primary)' },
        ].map(({label,val,c}) => (
          <div key={label} className="stat-card">
            <div className="stat-val" style={{ color:c }}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:700,marginBottom:8 }}>
          <span>Monthly Goal</span><span style={{ color }}>{kid.points} / {goal} pts</span>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width:`${progress}%`, background:`linear-gradient(90deg,${color},${color}99)` }}/>
        </div>
        <div style={{ fontSize:12,color:'var(--muted)',marginTop:6 }}>{progress}% of monthly goal achieved</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab==='history'?' active':''}`} onClick={()=>setTab('history')}>📜 History</button>
        <button className={`tab-btn${tab==='health'?' active':''}`}  onClick={()=>setTab('health')}>📏 Health Records</button>
      </div>

      {tab==='history' && (
        history.length===0
          ? <div className="empty-state"><div className="ei">📋</div><h3>No activity yet</h3><p>Assign points from the dashboard</p></div>
          : <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {history.map(h=><HistoryItem key={h.id} item={h} kids={[kid]} showUndo onUndo={()=>undoEntry(h.id,h.points)}/>)}
            </div>
      )}

      {tab==='health' && (
        <div>
          <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:14 }}>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowHlt(true)}>+ Add Record</button>
          </div>
          {health.length===0
            ? <div className="empty-state"><div className="ei">📏</div><h3>No health records</h3><p>Tap Update Health to log measurements</p><button className="btn btn-primary btn-sm" onClick={()=>setShowHlt(true)}>Add First Record</button></div>
            : <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {health.map(r=>(
                  <div key={r.id} style={{ background:'#fff',borderRadius:'var(--radius-sm)',padding:'13px 14px',boxShadow:'var(--shadow)',borderLeft:'4px solid #0984e3',display:'flex',gap:10,alignItems:'flex-start' }}>
                    <span style={{ fontSize:22 }}>📏</span>
                    <div>
                      <div style={{ fontWeight:700,fontSize:14 }}>{r.height}cm · {r.weight}kg · {r.blood}</div>
                      {r.allergies&&r.allergies!=='None' && <div style={{ fontSize:12,color:'var(--warn-text)' }}>⚠️ {r.allergies}</div>}
                      <div style={{ fontSize:11,color:'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Manual Points Modal */}
      <Modal open={showMan} onClose={()=>setShowMan(false)} title="✦ Adjust Points">
        <div className="form-group">
          <label>Points (+ to add, − to remove)</label>
          <input className="form-control" type="number" value={manPts} onChange={e=>setManPts(e.target.value)} placeholder="e.g. 5 or -3"/>
          <div style={{ display:'flex',gap:8,marginTop:8 }}>
            <button className="btn btn-success btn-sm" onClick={()=>setManPts(v=>String(Math.abs(parseInt(v)||5)))}>+ Add</button>
            <button className="btn btn-danger  btn-sm" onClick={()=>setManPts(v=>String(-Math.abs(parseInt(v)||3)))}>− Remove</button>
          </div>
        </div>
        <div className="form-group">
          <label>Reason / Message</label>
          <textarea className="form-control" value={manNote} onChange={e=>setManNote(e.target.value)} placeholder="Why adjusting points?" rows={2}/>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={()=>setShowMan(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={applyManual} disabled={busy}>{busy?'…':'Apply ⭐'}</button>
        </div>
      </Modal>

      {/* Health Modal */}
      <Modal open={showHlt} onClose={()=>setShowHlt(false)} title="📏 Update Health">
        <div className="form-row-3">
          <div className="form-group"><label>Height (cm)</label><input className="form-control" type="number" value={hForm.height||''} onChange={e=>setHForm(f=>({...f,height:e.target.value}))} placeholder="130"/></div>
          <div className="form-group"><label>Weight (kg)</label><input className="form-control" type="number" value={hForm.weight||''} onChange={e=>setHForm(f=>({...f,weight:e.target.value}))} placeholder="28"/></div>
          <div className="form-group"><label>Blood</label>
            <select className="form-control" value={hForm.blood||'O+'} onChange={e=>setHForm(f=>({...f,blood:e.target.value}))}>
              {BLOODS.map(b=><option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Allergies</label><input className="form-control" value={hForm.allergies||''} onChange={e=>setHForm(f=>({...f,allergies:e.target.value}))} placeholder="None"/></div>
          <div className="form-group"><label>Medical Notes</label><input className="form-control" value={hForm.medical||''} onChange={e=>setHForm(f=>({...f,medical:e.target.value}))} placeholder="Any conditions"/></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={()=>setShowHlt(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveHealth} disabled={busy}>{busy?'…':'Save 📏'}</button>
        </div>
      </Modal>
    </div>
  );
}
