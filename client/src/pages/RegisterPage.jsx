import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',password:'',phone:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const s = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.password.length<8) { setError('Password must be 8+ characters'); return; }
    setLoading(true);
    try {
      const { user } = await register(form);
      toast.success(`Welcome, ${user.first_name}! 🎉`);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⭐</div>
          <h1>Create Account</h1>
          <p>Start tracking your kids today</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group"><label>First Name *</label><input className="form-control" value={form.firstName} onChange={s('firstName')} placeholder="First name" required/></div>
            <div className="form-group"><label>Last Name</label><input className="form-control" value={form.lastName} onChange={s('lastName')} placeholder="Last name"/></div>
          </div>
          <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={s('email')} placeholder="your@email.com" required/></div>
          <div className="form-group"><label>Password * (min 8 chars)</label><input className="form-control" type="password" value={form.password} onChange={s('password')} placeholder="••••••••" required/></div>
          <div className="form-group"><label>Phone (optional)</label><input className="form-control" type="tel" value={form.phone} onChange={s('phone')} placeholder="+91 XXXXX XXXXX"/></div>
          {error && <p className="err-msg">{error}</p>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account ✦'}
          </button>
        </form>
        <div className="auth-switch">Have an account? <Link to="/login">Sign In</Link></div>
      </div>
    </div>
  );
}
