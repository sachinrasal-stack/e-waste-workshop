'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [settings, setSettings] = useState({ date: '', time: '', link: '' });
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  
  const [templates, setTemplates] = useState({
    welcome: '', rem1: '', rem2: '', rem3: ''
  });
  const [activeTemplateTab, setActiveTemplateTab] = useState('welcome');
  
  // New state for main navigation
  const [mainTab, setMainTab] = useState('participants'); 

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

      setTemplates({
        welcome: `Hello [NAME],\n\nThank you for registering for the *E-waste Awareness Workshop*!\n\n📅 *Date:* ${settingsData.date}\n🕓 *Time:* ${settingsData.time}\n🔗 *Join Link:* ${settingsData.link}\n\nWe look forward to seeing you there!\n\nTeam ProSAR`,
        rem1: `Dear [NAME],\n\nThis is a first reminder regarding our upcoming E-waste Awareness Workshop.\n\nDate: ${settingsData.date}\nTime: ${settingsData.time}\nJoin Link: ${settingsData.link}\n\nPlease keep the date blocked on your calendar.\n\nBest Regards,\nTeam ProSAR`,
        rem2: `Dear [NAME],\n\nOur E-waste Awareness Workshop is just one day away. We are excited to see you!\n\nDate: ${settingsData.date}\nTime: ${settingsData.time}\nWait for us at: ${settingsData.link}\n\nDon't forget to mark your calendars.\n\nBest Regards,\nTeam ProSAR`,
        rem3: `Dear [NAME],\n\nThe E-waste Awareness Workshop is starting right now! Please click the link below to join us.\n\nJoin Link: ${settingsData.link}\n\nSee you inside!\n\nBest Regards,\nTeam ProSAR`
      });
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });
  const handleTemplateChange = (e) => setTemplates({ ...templates, [activeTemplateTab]: e.target.value });

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
        alert(`Error: ${errorData.message}`);
        setSaveStatus('error');
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
      setSaveStatus('error');
    }
  };

  const generateWhatsAppLink = (user, type) => {
    let phone = user.whatsapp.replace(/\D/g, ''); 
    if (phone.length === 10) phone = '91' + phone; 
    let messageTemplate = templates[type] || templates.welcome;
    let message = messageTemplate.replace(/\[NAME\]/g, user.fullName);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const generateMailtoLink = (user) => {
    const subject = encodeURIComponent('E-waste Awareness Workshop');
    let messageTemplate = templates.welcome;
    let body = messageTemplate.replace(/\[NAME\]/g, user.fullName);
    return `mailto:${user.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return alert("No registrations to export.");
    const headers = ['Name', 'Email', 'Organization', 'City', 'WhatsApp', 'Registration Date'];
    const rows = registrations.map(reg => [
      `"${reg.fullName || ''}"`, `"${reg.email || ''}"`, `"${reg.organization || ''}"`,
      `"${reg.city || ''}"`, `"${reg.whatsapp || ''}"`, `"${new Date(reg.createdAt).toLocaleString()}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `workshop_participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><div className="loader" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#10b981' }}></div></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Pr</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>ProSAR Admin</h1>
        </div>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '6px', transition: 'background 0.2s' }} className="hover-bg-slate">
          Live Site ↗
        </Link>
      </header>

      {/* Main Tab Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', position: 'sticky', top: '72px', zIndex: 9 }}>
        <div style={{ display: 'flex', gap: '2rem', padding: '0 1rem', maxWidth: '1200px', width: '100%' }}>
          <button 
            onClick={() => setMainTab('participants')}
            style={{ background: 'none', border: 'none', borderBottom: mainTab === 'participants' ? '3px solid #10b981' : '3px solid transparent', color: mainTab === 'participants' ? '#10b981' : '#64748b', padding: '1rem 0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            👥 Participants
          </button>
          <button 
            onClick={() => setMainTab('templates')}
            style={{ background: 'none', border: 'none', borderBottom: mainTab === 'templates' ? '3px solid #10b981' : '3px solid transparent', color: mainTab === 'templates' ? '#10b981' : '#64748b', padding: '1rem 0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            📝 Templates
          </button>
          <button 
            onClick={() => setMainTab('settings')}
            style={{ background: 'none', border: 'none', borderBottom: mainTab === 'settings' ? '3px solid #10b981' : '3px solid transparent', color: mainTab === 'settings' ? '#10b981' : '#64748b', padding: '1rem 0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            ⚙️ Event Settings
          </button>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        
        {/* VIEW: SETTINGS */}
        {mainTab === 'settings' && (
          <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>⚙️ Event Settings</h2>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Workshop Date</label>
                <input type="text" name="date" value={settings.date} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e)=>e.target.style.borderColor='#10b981'} onBlur={(e)=>e.target.style.borderColor='#cbd5e1'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Workshop Time</label>
                <input type="text" name="time" value={settings.time} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e)=>e.target.style.borderColor='#10b981'} onBlur={(e)=>e.target.style.borderColor='#cbd5e1'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Meeting Link</label>
                <input type="url" name="link" value={settings.link} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e)=>e.target.style.borderColor='#10b981'} onBlur={(e)=>e.target.style.borderColor='#cbd5e1'} />
              </div>
              <button type="submit" disabled={saveStatus === 'loading'} style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', marginTop: '1rem' }} onMouseOver={(e)=>e.target.style.background='#059669'} onMouseOut={(e)=>e.target.style.background='#10b981'}>
                {saveStatus === 'loading' ? 'Saving...' : saveStatus === 'success' ? '✔ Saved Successfully' : 'Save Changes & Reset Event'}
              </button>
            </form>
          </section>
        )}

        {/* VIEW: TEMPLATES */}
        {mainTab === 'templates' && (
          <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>📝 Communication Templates</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Use the <code style={{background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px'}}>[NAME]</code> tag to automatically insert the participant's name. <br/>
              <em>Edits made here are instantly applied to the buttons in the Participants tab.</em>
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['welcome', 'rem1', 'rem2', 'rem3'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTemplateTab(tab)}
                  style={{ 
                    padding: '0.5rem 1rem', border: 'none', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: activeTemplateTab === tab ? '#10b981' : '#f1f5f9', 
                    color: activeTemplateTab === tab ? 'white' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'welcome' ? 'Welcome' : tab === 'rem1' ? 'Reminder 1' : tab === 'rem2' ? 'Reminder 2' : 'Reminder 3'}
                </button>
              ))}
            </div>

            <textarea 
              value={templates[activeTemplateTab]} 
              onChange={handleTemplateChange}
              style={{ width: '100%', height: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={(e)=>e.target.style.borderColor='#10b981'} onBlur={(e)=>e.target.style.borderColor='#cbd5e1'}
            />
          </section>
        )}

        {/* VIEW: PARTICIPANTS */}
        {mainTab === 'participants' && (
          <section style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>👥 Registered Participants</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, color: '#334155' }}>
                  Total: {registrations.length}
                </div>
                <button onClick={exportToCSV} style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Participant</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>City / Org</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>WhatsApp</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1rem' }}>No registrations found for this event.</td></tr>
                  ) : (
                    registrations.map(reg => (
                      <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{reg.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{reg.email}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                          {reg.city}<br/><span style={{ color: '#64748b' }}>{reg.organization}</span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{reg.whatsapp}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Welcome Button */}
                            <a href={generateWhatsAppLink(reg, 'welcome')} target="_blank" rel="noreferrer" title="Send Welcome via WhatsApp" style={{ background: '#25D366', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              💬 Welcome
                            </a>
                            
                            {/* Separator */}
                            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 0.5rem' }}></div>

                            {/* Reminders */}
                            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                              <a href={generateWhatsAppLink(reg, 'rem1')} target="_blank" rel="noreferrer" title="Reminder 1" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155', textDecoration: 'none', borderRight: '1px solid #e2e8f0' }} className="hover-bg-e2e8f0">R1</a>
                              <a href={generateWhatsAppLink(reg, 'rem2')} target="_blank" rel="noreferrer" title="Reminder 2" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155', textDecoration: 'none', borderRight: '1px solid #e2e8f0' }} className="hover-bg-e2e8f0">R2</a>
                              <a href={generateWhatsAppLink(reg, 'rem3')} target="_blank" rel="noreferrer" title="Reminder 3" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155', textDecoration: 'none' }} className="hover-bg-e2e8f0">R3</a>
                            </div>

                            {/* Email */}
                            <a href={generateMailtoLink(reg)} title="Send Email" style={{ background: '#ea4335', color: 'white', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', marginLeft: '0.5rem' }}>
                              📧
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-slate:hover { background: #f1f5f9; }
        .hover-bg-e2e8f0:hover { background: #e2e8f0; }
      `}} />
    </div>
  );
}
