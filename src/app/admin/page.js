'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [settings, setSettings] = useState({ date: '', time: '', link: '' });
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [notifyStatus, setNotifyStatus] = useState('idle');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, regRes] = await Promise.all([
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/register', { cache: 'no-store' })
      ]);
      
      const settingsData = await settingsRes.json();
      const regData = await regRes.json();
      
      setSettings(settingsData);
      setRegistrations(regData.registrations || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('loading');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to update settings'}`);
        setSaveStatus('error');
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
      setSaveStatus('error');
    }
  };

  const sendEmails = async () => {
    if (!confirm('Are you sure you want to trigger the Email Dispatch to all registered users? Please ensure your .env setup is complete!')) return;
    
    setNotifyStatus('loading');
    try {
      const res = await fetch('/api/notify', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setNotifyStatus('success');
      } else {
        alert('Failed: ' + data.message);
        setNotifyStatus('error');
      }
    } catch (err) {
      alert('Error connecting to server.');
      setNotifyStatus('error');
    }
    setTimeout(() => setNotifyStatus('idle'), 3000);
  };

  const generateWhatsAppLink = (user) => {
    // Basic phone number sanitization (remove non-digits)
    let phone = user.whatsapp.replace(/\D/g, ''); 
    // If user forgot country code and it's a 10 digit Indian number
    if (phone.length === 10) {
      phone = '91' + phone; 
    }
    
    const message = `Hello ${user.fullName},%0A%0AThank you for registering for the *E-waste Awareness Workshop*!%0A%0A📅 *Date:* ${settings.date}%0A🕓 *Time:* ${settings.time}%0A🔗 *Join Link:* ${settings.link}%0A%0AWe look forward to seeing you there!%0A%0ATeam ProSAR`;
    
    return `https://wa.me/${phone}?text=${message}`;
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
        <div style={{fontWeight: 800, color: '#333'}}>Admin Panel</div>
        <Link href="/">Back to Home</Link>
      </div>

      <div className="card">
        <h2>System Settings</h2>
        <form onSubmit={saveSettings}>
          <div className="form-group">
            <label>Workshop Date</label>
            <input type="text" name="date" className="form-control" value={settings.date} onChange={handleSettingsChange} required />
          </div>

          <div className="form-group">
            <label>Workshop Time</label>
            <input type="text" name="time" className="form-control" value={settings.time} onChange={handleSettingsChange} required />
          </div>

          <div className="form-group">
            <label>Meeting Link</label>
            <input type="url" name="link" className="form-control" value={settings.link} onChange={handleSettingsChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saveStatus === 'loading'}>
            {saveStatus === 'loading' ? <span className="loader"></span> : saveStatus === 'success' ? 'Saved!' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ marginBottom: 0 }}>Registered Users</h2>
          <div className="stat-box" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Count: {registrations.length}</div>
        </div>
        
        <button 
          className="btn" 
          onClick={sendEmails}
          disabled={notifyStatus === 'loading' || registrations.length === 0}
          style={{ background: '#ea4335', color: '#fff', marginBottom: '1rem' }}
        >
          {notifyStatus === 'loading' ? <span className="loader"></span> : '📧 Send Automatic Emails to All'}
        </button>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>City</th>
                <th>WhatsApp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No registrations yet.</td>
                </tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.fullName}<br/><small style={{color: '#666'}}>{reg.email}</small></td>
                    <td>{reg.organization}</td>
                    <td>{reg.city}</td>
                    <td>{reg.whatsapp}</td>
                    <td>
                      <a 
                        href={generateWhatsAppLink(reg)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#25D366', color: '#fff', display: 'inline-block', textDecoration: 'none' }}
                      >
                        💬 Send WhatsApp
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
