import { supabase } from './supabase';

const defaultSettings = {
  date: '16th April',
  time: '4:00 PM',
  link: 'https://forms.gle/g2sR3BSbkwFLqC22A'
};

export async function getData() {
  const [settingsRes, regRes] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('registrations').select('*').order('created_at', { ascending: false })
  ]);
  
  const formattedRegistrations = (regRes.data || []).map(r => ({
    id: r.id,
    fullName: r.full_name,
    organization: r.organization,
    city: r.city,
    whatsapp: r.whatsapp,
    email: r.email,
    createdAt: r.created_at
  }));

  const settingsData = settingsRes.data 
    ? { 
        date: settingsRes.data.date, 
        time: settingsRes.data.time, 
        link: settingsRes.data.link,
        last_reset_at: settingsRes.data.last_reset_at
      } 
    : defaultSettings;

  // Filter registrations to only show those created after the last reset
  const filteredRegistrations = settingsData.last_reset_at
    ? formattedRegistrations.filter(r => new Date(r.createdAt) > new Date(settingsData.last_reset_at))
    : formattedRegistrations;

  return {
    settings: settingsData,
    registrations: filteredRegistrations
  };
}

export async function addRegistration(user) {
  const dbUser = {
    full_name: user.fullName,
    organization: user.organization,
    city: user.city,
    whatsapp: user.whatsapp,
    email: user.email
  };
  const { error } = await supabase.from('registrations').insert([dbUser]);
  if (error) throw error;
}

export async function updateSettings(settings) {
  const { data, error } = await supabase.from('settings').upsert({ 
    id: 1, 
    date: settings.date,
    time: settings.time,
    link: settings.link,
    last_reset_at: new Date().toISOString() 
  }).select();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Database Update Failed: Record was blocked by Supabase Row-Level Security (RLS). Please check your Supabase Table RLS Policies.');
  }
}
