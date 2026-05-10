import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email:'demo@kidpoints.com', password:'demo1234' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { user } = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.first_name}! 👋`);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⭐</div>
          <h1>KidPoints</h1>
          <p>Track kids' activities & rewards</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label>Email</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="parent@email.com" required/>
          </div>
          <div className="form-group"><label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" required/>
          </div>
          {error && <p className="err-msg">{error}</p>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In ✦'}
          </button>
        </form>
        <div className="auth-hint">Demo: demo@kidpoints.com / demo1234</div>
        <div className="auth-switch">No account? <Link to="/register">Register</Link></div>
      </div>
    </div>
  );
}
