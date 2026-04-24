'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [settings, setSettings] = useState({ date: '', time: '', link: '' });
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [notifyStatus, setNotifyStatus] = useState('idle');
  
  const [selectedReminder, setSelectedReminder] = useState('1');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  const getTemplate = (type, currentSettings) => {
    switch (type) {
      case '1':
        return {
          subject: 'Reminder 1: Upcoming E-waste Awareness Workshop',
          message: `Dear Participant,\n\nThis is a first reminder regarding our upcoming E-waste Awareness Workshop.\n\nDate: ${currentSettings.date}\nTime: ${currentSettings.time}\nJoin Link: ${currentSettings.link}\n\nPlease keep the date blocked on your calendar.\n\nBest Regards,\nTeam ProSAR`
        };
      case '2':
        return {
          subject: 'Reminder 2: E-waste Workshop is Tomorrow!',
          message: `Dear Participant,\n\nOur E-waste Awareness Workshop is just one day away. We are excited to see you!\n\nDate: ${currentSettings.date}\nTime: ${currentSettings.time}\nWait for us at: ${currentSettings.link}\n\nDon't forget to mark your calendars.\n\nBest Regards,\nTeam ProSAR`
        };
      case '3':
        return {
          subject: 'Reminder 3: We are LIVE! Join the E-waste Workshop Now',
          message: `Dear Participant,\n\nThe E-waste Awareness Workshop is starting right now! Please click the link below to join us.\n\nJoin Link: ${currentSettings.link}\n\nSee you inside!\n\nBest Regards,\nTeam ProSAR`
        };
      default:
        return { subject: '', message: '' };
    }
  };

  useEffect(() => {
    if (!loading) {
      const template = getTemplate(selectedReminder, settings);
      setReminderSubject(template.subject);
      setReminderMessage(template.message);
    }
  }, [selectedReminder, loading]);

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
    if (!confirm('Are you sure you want to send this reminder to all registered users? Please ensure your .env setup is complete!')) return;
    
    setNotifyStatus('loading');
    try {
      const res = await fetch('/api/notify', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: reminderSubject, message: reminderMessage })
      });
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

  const sendBulkWhatsApp = () => {
    if (!confirm(`This will attempt to open ${registrations.length} new WhatsApp Web tabs sequentially. You MUST "Allow Popups" for this site in your browser for this to work.\n\nReady to open tabs?`)) return;
    
    registrations.forEach((reg, index) => {
      // 800ms delay helps avoid overwhelming the browser
      setTimeout(() => {
        window.open(generateWhatsAppLink(reg), '_blank');
      }, index * 800);
    });
  };

  const generateWhatsAppLink = (user) => {
    // Basic phone number sanitization (remove non-digits)
    let phone = user.whatsapp.replace(/\D/g, ''); 
    // If user forgot country code and it's a 10 digit Indian number
    if (phone.length === 10) {
      phone = '91' + phone; 
    }
    
    // Use the dynamic reminder message if available, otherwise fallback
    const message = reminderMessage 
      ? encodeURIComponent(reminderMessage) 
      : encodeURIComponent(`Hello ${user.fullName},\n\nThank you for registering for the *E-waste Awareness Workshop*!\n\n📅 *Date:* ${settings.date}\n🕓 *Time:* ${settings.time}\n🔗 *Join Link:* ${settings.link}\n\nWe look forward to seeing you there!\n\nTeam ProSAR`);
    
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
        <h2>Send Bulk Reminders</h2>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ddd' }}>
          <div className="form-group">
            <label>Select Reminder Type</label>
            <select 
              className="form-control" 
              value={selectedReminder} 
              onChange={(e) => setSelectedReminder(e.target.value)}
              style={{ marginBottom: '1rem' }}
            >
              <option value="1">Reminder 1 (General Upcoming)</option>
              <option value="2">Reminder 2 (1 Day Before)</option>
              <option value="3">Reminder 3 (Starting Now / Live)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email Subject</label>
            <input 
              type="text" 
              className="form-control" 
              value={reminderSubject} 
              onChange={(e) => setReminderSubject(e.target.value)} 
              placeholder="Email Subject"
            />
          </div>

          <div className="form-group">
            <label>Email Message Content</label>
            <textarea 
              className="form-control" 
              rows="8" 
              value={reminderMessage} 
              onChange={(e) => setReminderMessage(e.target.value)} 
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn" 
              onClick={sendEmails}
              disabled={notifyStatus === 'loading' || registrations.length === 0}
              style={{ background: '#ea4335', color: '#fff', flex: 1, padding: '12px', fontSize: '1rem' }}
            >
              {notifyStatus === 'loading' ? <span className="loader"></span> : `📧 Email All (${registrations.length})`}
            </button>

            <button 
              className="btn" 
              type="button"
              onClick={sendBulkWhatsApp}
              disabled={registrations.length === 0}
              style={{ background: '#25D366', color: '#fff', flex: 1, padding: '12px', fontSize: '1rem' }}
            >
               💬 Open WhatsApp for All (${registrations.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ marginBottom: 0 }}>Registered Users</h2>
          <div className="stat-box" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Count: {registrations.length}</div>
        </div>

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
