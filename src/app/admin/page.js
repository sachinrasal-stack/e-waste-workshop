'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [settings, setSettings] = useState({ date: '', time: '', link: '' });
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [templateSaveStatus, setTemplateSaveStatus] = useState('idle');
  
  // Templates state
  const [waTemplates, setWaTemplates] = useState({
    welcome: '', rem1: '', rem2: '', rem3: ''
  });
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: { subject: '', body: '' },
    rem1: { subject: '', body: '' },
    rem2: { subject: '', body: '' },
    rem3: { subject: '', body: '' }
  });

  const [mainTab, setMainTab] = useState('dispatch'); 
  const [templateEditorType, setTemplateEditorType] = useState('wa'); // 'wa' or 'email'
  const [activeTemplateTab, setActiveTemplateTab] = useState('welcome');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, regRes, tempRes] = await Promise.all([
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/register', { cache: 'no-store' }),
        fetch('/api/templates', { cache: 'no-store' })
      ]);
      
      const settingsData = await settingsRes.json();
      const regData = await regRes.json();
      const templatesData = await tempRes.json();
      
      setSettings(settingsData);
      setRegistrations(regData.registrations || []);

      // If templates exist in DB, use them. Otherwise use defaults.
      if (Array.isArray(templatesData) && templatesData.length > 0) {
        const wa = {};
        const email = {};
        templatesData.forEach(t => {
          if (t.type === 'wa') wa[t.name] = t.content.body;
          if (t.type === 'email') email[t.name] = t.content;
        });
        setWaTemplates(prev => ({ ...prev, ...wa }));
        setEmailTemplates(prev => ({ ...prev, ...email }));
      } else {
        // Defaults
        setWaTemplates({
          welcome: `Hello [NAME],\n\nThank you for registering for the *E-waste Awareness Workshop*!\n\n📅 *Date:* ${settingsData.date}\n🕓 *Time:* ${settingsData.time}\n🔗 *Join Link:* ${settingsData.link}\n\nWe look forward to seeing you there!\n\nTeam ProSAR`,
          rem1: `Dear [NAME],\n\nThis is a first reminder regarding our upcoming E-waste Awareness Workshop.\n\nDate: ${settingsData.date}\nTime: ${settingsData.time}\nJoin Link: ${settingsData.link}\n\nPlease keep the date blocked on your calendar.\n\nBest Regards,\nTeam ProSAR`,
          rem2: `Dear [NAME],\n\nOur E-waste Awareness Workshop is just one day away. We are excited to see you!\n\nDate: ${settingsData.date}\nTime: ${settingsData.time}\nWait for us at: ${settingsData.link}\n\nDon't forget to mark your calendars.\n\nBest Regards,\nTeam ProSAR`,
          rem3: `Dear [NAME],\n\nThe E-waste Awareness Workshop is starting right now! Please click the link below to join us.\n\nJoin Link: ${settingsData.link}\n\nSee you inside!\n\nBest Regards,\nTeam ProSAR`
        });

        setEmailTemplates({
          welcome: {
            subject: `Confirmed: Your Registration for the E-Waste Awareness Workshop`,
            body: `Dear [NAME],\n\nThank you for taking a proactive step towards environmental responsibility by registering for our upcoming E-Waste Awareness Workshop.\n\nWorkshop Details:\n📅 Date: ${settingsData.date}\n🕓 Time: ${settingsData.time}\n\nJoin Link:\n${settingsData.link}\n\nIn this session, we will explore real-world stories and practical steps to manage electronic waste legally and safely.\n\nWe look forward to seeing you there!\n\nBest Regards,\n\nTeam ProSAR\nProSAR EcoTech Pvt Ltd\nwww.prosar.in`
          },
          rem1: {
            subject: `Upcoming: E-Waste Awareness Workshop Reminder`,
            body: `Dear [NAME],\n\nThis is a friendly reminder for our upcoming workshop on sustainable e-waste management.\n\nAs a responsible citizen, your participation is vital in protecting our environment from hazardous electronic waste.\n\nWorkshop Details:\n📅 Date: ${settingsData.date}\n🕓 Time: ${settingsData.time}\n\nJoin Link:\n${settingsData.link}\n\nPlease ensure you have marked your calendar. See you soon!\n\nBest Regards,\n\nTeam ProSAR\nProSAR EcoTech Pvt Ltd\nwww.prosar.in`
          },
          rem2: {
            subject: `Reminder: Our E-Waste Workshop is Tomorrow!`,
            body: `Dear [NAME],\n\nWe are excited to see you tomorrow for the E-Waste Awareness Workshop! \n\nGet ready to learn how you can make a real difference in the way we handle electronic waste at home and in the workplace.\n\nWorkshop Details:\n📅 Date: ${settingsData.date}\n🕓 Time: ${settingsData.time}\n\nJoin Link:\n${settingsData.link}\n\nBest Regards,\n\nTeam ProSAR\nProSAR EcoTech Pvt Ltd\nwww.prosar.in`
          },
          rem3: {
            subject: `🔴 LIVE NOW: Join the E-Waste Awareness Workshop`,
            body: `Dear [NAME],\n\nThe E-Waste Awareness Workshop is starting right now!\n\nPlease click the link below to join the session immediately:\n\n${settingsData.link}\n\nWe are waiting for you inside!\n\nBest Regards,\n\nTeam ProSAR\nProSAR EcoTech Pvt Ltd\nwww.prosar.in`
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });
  
  const handleTemplateChange = (e) => {
    if (templateEditorType === 'wa') {
      setWaTemplates({ ...waTemplates, [activeTemplateTab]: e.target.value });
    } else {
      setEmailTemplates({ 
        ...emailTemplates, 
        [activeTemplateTab]: { ...emailTemplates[activeTemplateTab], [e.target.name]: e.target.value } 
      });
    }
  };

  const applyFormatting = (tag) => {
    const textarea = document.getElementById('template-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (tag === 'B') replacement = `*${selectedText}*`;
    else if (tag === 'I') replacement = `_${selectedText}_`;
    else if (tag === 'S') replacement = `~${selectedText}~`;
    else if (tag === 'NAME') replacement = `[NAME]`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    
    if (templateEditorType === 'wa') {
      setWaTemplates({ ...waTemplates, [activeTemplateTab]: newText });
    } else {
      setEmailTemplates({ 
        ...emailTemplates, 
        [activeTemplateTab]: { ...emailTemplates[activeTemplateTab], body: newText } 
      });
    }

    setTimeout(() => {
      textarea.focus();
      if (tag === 'NAME') {
        textarea.setSelectionRange(start + 6, start + 6);
      } else {
        textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
      }
    }, 0);
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
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
      setSaveStatus('error');
    }
  };

  const saveAllTemplates = async () => {
    setTemplateSaveStatus('loading');
    const allTemplates = [
      ...Object.entries(waTemplates).map(([name, body]) => ({ type: 'wa', name, content: { body } })),
      ...Object.entries(emailTemplates).map(([name, content]) => ({ type: 'email', name, content }))
    ];

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allTemplates)
      });
      if (res.ok) {
        setTemplateSaveStatus('success');
        setTimeout(() => setTemplateSaveStatus('idle'), 3000);
      } else {
        alert('Failed to save templates');
        setTemplateSaveStatus('error');
      }
    } catch (err) {
      alert('Network Error');
      setTemplateSaveStatus('error');
    }
  };

  const generateWhatsAppLink = (user, type) => {
    let phone = user.whatsapp.replace(/\D/g, ''); 
    if (phone.length === 10) phone = '91' + phone; 
    let messageTemplate = waTemplates[type] || waTemplates.welcome;
    let message = messageTemplate.replace(/\[NAME\]/g, user.fullName);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const generateMailtoLink = (user, type) => {
    const template = emailTemplates[type] || emailTemplates.welcome;
    const subject = encodeURIComponent(template.subject);
    let body = template.body.replace(/\[NAME\]/g, user.fullName);
    const encodedBody = encodeURIComponent(body).replace(/%0A/g, '%0D%0A');
    return `mailto:${user.email}?subject=${subject}&body=${encodedBody}`;
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
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>ProSAR Dispatch Admin</h1>
        </div>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '6px', transition: 'background 0.2s' }} className="hover-bg-slate">
          Live Site ↗
        </Link>
      </header>

      {/* Main Tab Navigation */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', position: 'sticky', top: '72px', zIndex: 9 }}>
        <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1rem', maxWidth: '1200px', width: '100%', overflowX: 'auto' }}>
          {['overview', 'dispatch', 'templates', 'settings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setMainTab(tab)}
              style={{ background: 'none', border: 'none', borderBottom: mainTab === tab ? '3px solid #10b981' : '3px solid transparent', color: mainTab === tab ? '#10b981' : '#64748b', padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'dispatch' ? '🚀 Dispatch' : tab === 'templates' ? '📝 Templates' : '⚙️ Settings'}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>
        
        {/* VIEW: OVERVIEW */}
        {mainTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981' }}>{registrations.length}</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Active Registrations</div>
            </div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{settings.date}</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Current Event Date</div>
            </div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
               <button onClick={exportToCSV} style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>📥 Export Participants (CSV)</button>
            </div>
          </div>
        )}

        {/* VIEW: DISPATCH */}
        {mainTab === 'dispatch' && (
          <section style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>🚀 Manual Reminder Dispatch</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Send individual reminders to participants via WhatsApp or Email.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Participant</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>WhatsApp Reminders</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Email Reminders</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No registrations found.</td></tr>
                  ) : (
                    registrations.map(reg => (
                      <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{reg.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{reg.whatsapp} | {reg.city}</div>
                        </td>
                        
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <a href={generateWhatsAppLink(reg, 'welcome')} target="_blank" rel="noreferrer" title="Welcome" style={{ padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}>W</a>
                            <a href={generateWhatsAppLink(reg, 'rem1')} target="_blank" rel="noreferrer" title="Rem 1" style={{ padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.85 }}>R1</a>
                            <a href={generateWhatsAppLink(reg, 'rem2')} target="_blank" rel="noreferrer" title="Rem 2" style={{ padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.75 }}>R2</a>
                            <a href={generateWhatsAppLink(reg, 'rem3')} target="_blank" rel="noreferrer" title="Rem 3" style={{ padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.65 }}>R3</a>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <a href={generateMailtoLink(reg, 'welcome')} title="Welcome Email" style={{ padding: '0.5rem', background: '#ea4335', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}>W</a>
                            <a href={generateMailtoLink(reg, 'rem1')} title="Rem 1 Email" style={{ padding: '0.5rem', background: '#ea4335', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.85 }}>R1</a>
                            <a href={generateMailtoLink(reg, 'rem2')} title="Rem 2 Email" style={{ padding: '0.5rem', background: '#ea4335', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.75 }}>R2</a>
                            <a href={generateMailtoLink(reg, 'rem3')} title="Rem 3 Email" style={{ padding: '0.5rem', background: '#ea4335', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', opacity: 0.65 }}>R3</a>
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

        {/* VIEW: TEMPLATES */}
        {mainTab === 'templates' && (
          <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>📝 Template Editor</h2>
              <button 
                onClick={saveAllTemplates} 
                disabled={templateSaveStatus === 'loading'}
                style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
              >
                {templateSaveStatus === 'loading' ? 'Saving...' : templateSaveStatus === 'success' ? '✔ Templates Saved' : '💾 Save All Templates'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button onClick={() => setTemplateEditorType('wa')} style={{ border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, background: templateEditorType === 'wa' ? 'white' : 'transparent', color: templateEditorType === 'wa' ? '#10b981' : '#64748b' }}>WhatsApp</button>
                <button onClick={() => setTemplateEditorType('email')} style={{ border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, background: templateEditorType === 'email' ? 'white' : 'transparent', color: templateEditorType === 'email' ? '#ea4335' : '#64748b' }}>Email</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['welcome', 'rem1', 'rem2', 'rem3'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTemplateTab(tab)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: activeTemplateTab === tab ? '#334155' : '#f1f5f9', color: activeTemplateTab === tab ? 'white' : '#475569' }}>
                    {tab === 'welcome' ? 'Welcome' : `Rem ${tab.slice(-1)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px 8px 0 0', border: '1px solid #cbd5e1', borderBottom: 'none' }}>
              <button onClick={() => applyFormatting('B')} style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} title="Bold (WhatsApp)">B</button>
              <button onClick={() => applyFormatting('I')} style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', fontStyle: 'italic', cursor: 'pointer' }} title="Italic (WhatsApp)">I</button>
              <button onClick={() => applyFormatting('S')} style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', textDecoration: 'line-through', cursor: 'pointer' }} title="Strikethrough (WhatsApp)">S</button>
              <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></div>
              <button onClick={() => applyFormatting('NAME')} style={{ padding: '0 10px', height: '32px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', cursor: 'pointer' }} title="Insert Name Placeholder">➕ [NAME]</button>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#94a3b8', alignSelf: 'center' }}>Formatting works best for WhatsApp</span>
            </div>
            
            {templateEditorType === 'wa' ? (
              <textarea 
                id="template-editor"
                value={waTemplates[activeTemplateTab]} 
                onChange={handleTemplateChange}
                style={{ width: '100%', height: '350px', padding: '1.25rem', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={(e)=>e.target.style.borderColor='#10b981'} onBlur={(e)=>e.target.style.borderColor='#cbd5e1'}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #cbd5e1', borderRadius: '0 0 12px 12px', padding: '1.5rem', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Email Subject Line</label>
                  <input type="text" name="subject" value={emailTemplates[activeTemplateTab].subject} onChange={handleTemplateChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Email Body Content</label>
                  <textarea id="template-editor" name="body" value={emailTemplates[activeTemplateTab].body} onChange={handleTemplateChange} style={{ width: '100%', height: '300px', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* VIEW: SETTINGS */}
        {mainTab === 'settings' && (
          <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>⚙️ Event Settings</h2>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Workshop Date</label>
                <input type="text" name="date" value={settings.date} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Workshop Time</label>
                <input type="text" name="time" value={settings.time} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Meeting Link</label>
                <input type="url" name="link" value={settings.link} onChange={handleSettingsChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
              </div>
              <button type="submit" disabled={saveStatus === 'loading'} style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', marginTop: '1rem' }}>
                {saveStatus === 'loading' ? 'Saving...' : saveStatus === 'success' ? '✔ Saved Successfully' : 'Save Changes & Reset Event'}
              </button>
            </form>
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
