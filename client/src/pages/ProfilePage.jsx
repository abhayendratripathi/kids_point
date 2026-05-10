import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { profileAPI, kidsAPI, historyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const age = dob => Math.floor((Date.now()-new Date(dob))/(1000*60*60*24*365.25));

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'',lastName:'',phone:'',family:'' });
  const [kids, setKids] = useState([]);
  const [kidHist, setKidHist] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const s = k => e => setForm(p=>({...p,[k]:e.target.value}));

  useEffect(() => {
    if (user) setForm({ firstName:user.first_name||'', lastName:user.last_name||'', phone:user.phone||'', family:user.family||'' });
    Promise.all([kidsAPI.getAll(), historyAPI.getAll()])
      .then(([kr,hr]) => {
        setKids(kr.data);
        const g={}; hr.data.forEach(h=>{ g[h.kid_id]=(g[h.kid_id]||0)+1; }); setKidHist(g);
      })
      .finally(()=>setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try { const { data } = await profileAPI.update(form); setUser(data); toast.success('Profile saved! 💾'); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const doLogout = () => { logout(); toast.success('Signed out 👋'); navigate('/login'); };

  const initials = `${user?.first_name?.[0]||''}${user?.last_name?.[0]||''}`.toUpperCase() || 'P';

  return (
    <div>
      <div className="page-header"><h1 className="page-title">👤 Parent Profile</h1></div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:18,flexWrap:'wrap' }}>
          <div style={{ width:66,height:66,borderRadius:'50%',background:'linear-gradient(135deg,#6C5CE7,#a29bfe)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24,fontWeight:900,flexShrink:0 }}>{initials}</div>
          <div>
            <div style={{ fontSize:19,fontWeight:900 }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ fontSize:13,color:'var(--muted)' }}>{user?.email}</div>
            <span className="badge badge-primary" style={{ marginTop:5 }}>Parent Account</span>
          </div>
        </div>
        <div className="divider"/>
        <div className="form-row">
          <div className="form-group"><label>First Name</label><input className="form-control" value={form.firstName} onChange={s('firstName')}/></div>
          <div className="form-group"><label>Last Name</label><input className="form-control" value={form.lastName} onChange={s('lastName')}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={s('phone')} placeholder="+91 XXXXX XXXXX"/></div>
          <div className="form-group"><label>Family Name</label><input className="form-control" value={form.family} onChange={s('family')} placeholder="The Sharma Family"/></div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':'💾 Save Changes'}</button>
      </div>

      {/* Kids overview */}
      <div className="page-header" style={{ marginTop:24 }}>
        <h2 className="page-title" style={{ fontSize:18 }}>👶 Kids Overview</h2>
      </div>
      {loading
        ? <div style={{ padding:20,textAlign:'center' }}><div className="spinner"/></div>
        : kids.length===0
          ? <div className="empty-state"><div className="ei">👶</div><p>No kids added yet</p></div>
          : <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {kids.map(kid => (
                <div key={kid.id} className="card" style={{ padding:'14px 16px',cursor:'pointer' }} onClick={()=>navigate(`/kids/${kid.id}`)}>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <span style={{ fontSize:32 }}>{kid.gender==='girl'?'👧':'🧒'}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:800,fontSize:16 }}>{kid.name} <span className="badge badge-primary">{age(kid.dob)} yrs</span></div>
                      <div style={{ fontSize:12,color:'var(--muted)' }}>
                        {kid.height>0&&`📏 ${kid.height}cm `}{kid.weight>0&&`⚖️ ${kid.weight}kg `}🩸 {kid.blood}
                      </div>
                    </div>
                    <div style={{ textAlign:'right',flexShrink:0 }}>
                      <div style={{ fontSize:20,fontWeight:900,color:kid.points>=0?'var(--success)':'var(--danger)' }}>{kid.points>0?'+':''}{kid.points}</div>
                      <div style={{ fontSize:11,color:'var(--muted)' }}>{kidHist[kid.id]||0} activities</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      }

      {/* Settings */}
      <div className="page-header" style={{ marginTop:24 }}>
        <h2 className="page-title" style={{ fontSize:18 }}>⚙️ Settings</h2>
      </div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0' }}>
          <div>
            <div style={{ fontWeight:700 }}>Monthly Point Goal</div>
            <div style={{ fontSize:12,color:'var(--muted)' }}>Target per kid per month</div>
          </div>
          <input className="form-control" type="number" defaultValue="100" style={{ width:80,textAlign:'center' }} min="10" max="500"/>
        </div>
        <div className="divider"/>
        <button className="btn btn-primary btn-sm" onClick={()=>toast.success('Settings saved!')}>Save Settings</button>
      </div>

      <div style={{ paddingBottom:20 }}>
        <button className="btn btn-danger btn-full" onClick={doLogout}>🚪 Sign Out</button>
      </div>
    </div>
  );
}
