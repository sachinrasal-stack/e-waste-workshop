'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    city: '',
    whatsapp: '',
    email: ''
  });
  const [submitState, setSubmitState] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      const regRes = await fetch('/api/register');
      const regData = await regRes.json();
      setTotal(regData.total);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitState('success');
        setMessage(data.message);
        setTotal(prev => prev + 1);
        setFormData({ fullName: '', organization: '', city: '', whatsapp: '', email: '' });
      } else {
        setSubmitState('error');
        setMessage(data.message);
      }
    } catch (error) {
      setSubmitState('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <div className="loader" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--primary-color)' }}></div>
      </div>
    );
  }

  return (
    <>
      <div className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/prosar-logo.png" alt="ProSAR Logo" style={{ height: '40px', borderRadius: '4px' }} />
          <div style={{fontWeight: 800, color: 'var(--primary-color)'}}>ProSAR EcoTech Pvt Ltd</div>
        </div>
      </div>

      <div className="card">
        <div className="hero-title-container">
          <h1 className="text-center" style={{ margin: 0, fontWeight: 900, fontSize: 'min(7vw, 2rem)', letterSpacing: '-0.5px', border: '2px solid #16a34a', padding: '1.2rem', borderRadius: '12px', background: 'rgba(255,255,255,0.5)' }}>
            <span style={{ display: 'block', fontSize: '1.1em', marginBottom: '0.2rem', color: '#14532d' }}>Electronic Waste</span>
            <span style={{ display: 'block', fontSize: '1.1em', marginBottom: '0.4rem', color: '#14532d' }}>(E-waste)</span>
            <span style={{ display: 'block', fontSize: '0.9em', color: '#14532d' }}>Awareness Workshop</span>
          </h1>
        </div>
        <div className="mb-2" style={{ textAlign: 'left' }}>
          <p className="subtitle-strong">
            E-waste is not just waste — it’s a responsibility.
          </p>
          <p>
            As responsible citizens, ensuring legal and safe disposal of electronic waste is our duty towards our homes, workplaces, and the environment we depend on.<br/>
            Let’s act today to protect Mother Nature for tomorrow.
          </p>
        </div>

        <div className="workshop-details">
          <h2 className="text-center">📅 Workshop Details</h2>
          <p><strong>Date:</strong> {settings?.date}</p>
          <p><strong>Time:</strong> {settings?.time}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
          <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#fff', borderRadius: '8px', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 800, color: '#b45309', marginBottom: '0.8rem', fontSize: '1.05rem' }}>
              No Technical Gyaan… Just a Real Hindi Story 😊
            </p>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>The story of Phunsukh Wangdu</p>
            <p style={{ marginBottom: '0.2rem' }}>🚔 Arrested by the police</p>
            <p style={{ marginBottom: '1rem' }}>🏥 While his wife was in the hospital</p>
            <p style={{ fontStyle: 'italic', fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>
              What really happened?<br/>
              Join us to uncover the truth… with a happy ending 😊
            </p>
          </div>
        </div>

        <div style={{ justifyContent: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16a34a', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              It's absolutely FREE
            </h2>
            <p style={{ fontWeight: '700', color: '#059669', fontSize: '1rem', margin: 0 }}>
              no hidden charges.
            </p>
          </div>
        </div>

        <ul className="highlight-list">
          <li>This workshop is fully sponsored by ProSAR</li>
          <li>Get an NGO-issued Certificate of Participation</li>
        </ul>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">10+</div>
            <div className="stat-label">Total Workshops</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{200 + total}+</div>
            <div className="stat-label">Total Attendees</div>
          </div>
        </div>
      </div>

      <div className="card" id="register">
        {submitState === 'success' ? (
           <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
            <h2 className="flash-success" style={{ color: '#047857', marginBottom: '1.5rem', whiteSpace: 'nowrap', fontSize: 'clamp(1rem, 6.5vw, 1.5rem)' }}>🎉 Registration Successful!</h2>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p>Thank you for taking a responsible step towards sustainable e-waste management.</p>
              <p>You are now part of a growing community of aware and compliant citizens who care about the environment and legal responsibility.</p>
              <p>📩 Workshop details and joining instructions will be shared with you shortly.</p>
              <p>📜 Your NGO participation certificate will be issued after successful attendance.</p>
              <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Let’s work together to protect our planet — responsibly and legally.</p>
            </div>
            
            <div style={{ borderTop: '2px solid #a7f3d0', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#065f46' }}>Become an E-Waste Warrior of Your City</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Join our dedicated E-Waste Task Force WhatsApp Community</p>
              <a 
                href="https://chat.whatsapp.com/HKkZPJB9kDSEWprnxmdS8L?mode=gi_t" 
                target="_blank" 
                rel="noreferrer" 
                className="btn" 
                style={{ background: '#25D366', color: '#fff', textDecoration: 'none', display: 'inline-flex' }}
              >
                💬 Join WhatsApp Group
              </a>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>Register Now</h2>
            <p style={{ fontSize: '0.95rem', textAlign: 'left', color: '#475569', marginBottom: '1.5rem' }}>🌱 A small step from you can make a big environmental impact!</p>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" autoComplete="name" />
            </div>

            <div className="form-group">
              <label>Organization</label>
              <input type="text" name="organization" className="form-control" value={formData.organization} onChange={handleChange} required placeholder="Your company or college" autoComplete="organization" />
            </div>

            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} required placeholder="Your city" autoComplete="address-level2" />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" name="whatsapp" className="form-control" value={formData.whatsapp} onChange={handleChange} required placeholder="e.g. +91 9876543210" autoComplete="tel" />
            </div>

            <div className="form-group">
              <label>Email ID</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" autoComplete="email" />
            </div>

            {submitState === 'error' && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem' }} disabled={submitState === 'loading'}>
              {submitState === 'loading' ? <span className="loader"></span> : 'Submit Registration'}
            </button>
          </form>
          </>
        )}
      </div>
    </>
  );
}
