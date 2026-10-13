import { useEffect, useState } from 'react';
import { createPortfolioItem, deletePortfolioItem, getMyPortfolio, updatePortfolioItem } from '../api/portfolioApi';

const EMPTY = { type: 'Project', title: '', description: '', url: '', date: '' };

export default function StudentPortfolioPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    setLoading(true); setError('');
    try { setItems(await getMyPortfolio()); }
    catch (e) { setError(e.message || 'Could not load your portfolio.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event) {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true);
    const clean = { ...form, title: form.title.trim(), description: form.description.trim(), url: form.url.trim() };
    try {
      if (editingId) {
        const updated = await updatePortfolioItem(editingId, clean);
        setItems(current => current.map(item => item.id === editingId ? updated : item));
        setMessage('Portfolio item updated.');
      } else {
        const created = await createPortfolioItem(clean);
        setItems(current => [created, ...current]);
        setMessage('Portfolio item saved to your account.');
      }
      setForm(EMPTY); setEditingId(null);
    } catch (e) { setError(e.message || 'Could not save portfolio item.'); }
    finally { setSaving(false); }
  }
  function edit(item) {
    setForm({ type: item.type || 'Project', title: item.title || '', description: item.description || '', url: item.url || '', date: item.date || '' });
    setEditingId(item.id); setMessage(''); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function remove(id) {
    if (!window.confirm('Delete this portfolio item?')) return;
    setError(''); setMessage('');
    try {
      await deletePortfolioItem(id); setItems(current => current.filter(item => item.id !== id));
      setMessage('Portfolio item deleted.');
      if (editingId === id) { setEditingId(null); setForm(EMPTY); }
    } catch (e) { setError(e.message || 'Could not delete portfolio item.'); }
  }
  function cancelEdit() { setEditingId(null); setForm(EMPTY); setError(''); setMessage(''); }

  return <main className="dashboard-page"><div className="container py-5">
    <button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>← Back to dashboard</button>
    <div className="mb-4"><span className="text-muted">Career profile</span><h1 className="h2 mb-1">My digital portfolio</h1><p className="text-muted">Organize your projects, certificates, achievements and internships in one place.</p></div>
    {message && <div className="alert alert-success" role="status">{message}</div>}
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <section className="feature-card mb-4"><h2 className="h4">{editingId ? 'Edit portfolio item' : 'Add portfolio item'}</h2><form onSubmit={submit}>
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label" htmlFor="portfolioType">Type</label><select id="portfolioType" className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Project</option><option>Certificate</option><option>Internship</option><option>Achievement</option><option>Research</option></select></div>
        <div className="col-md-9"><label className="form-label" htmlFor="portfolioTitle">Title</label><input id="portfolioTitle" className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={120} placeholder="e.g. Sales forecasting project" /></div>
        <div className="col-12"><label className="form-label" htmlFor="portfolioDescription">Description</label><textarea id="portfolioDescription" className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={1200} placeholder="Describe your work, tools used and outcomes" /></div>
        <div className="col-md-8"><label className="form-label" htmlFor="portfolioUrl">Evidence link (optional)</label><input id="portfolioUrl" type="url" className="form-control" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="portfolioDate">Completion date (optional)</label><input id="portfolioDate" type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
      </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add to portfolio'}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit}>Cancel</button>}</div>
    </form></section>
    <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h4 mb-0">Your portfolio</h2><span className="badge text-bg-light">{items.length} item{items.length === 1 ? '' : 's'}</span></div>
    {loading ? <p>Loading portfolio…</p> : items.length === 0 ? <div className="feature-card text-center py-5"><h3 className="h5">Your portfolio starts here</h3><p className="text-muted mb-0">Add a project, certificate or internship to showcase your experience.</p></div> : <div className="row g-3">{items.map(item => <div className="col-lg-6" key={item.id}><article className="feature-card h-100"><div className="d-flex justify-content-between gap-2"><span className="badge bg-primary-subtle text-primary">{item.type}</span>{item.date && <span className="small text-muted">{item.date}</span>}</div><h3 className="h5 mt-3">{item.title}</h3><p className="text-muted">{item.description || 'No description added.'}</p>{item.url && <p><a href={item.url} target="_blank" rel="noreferrer">View evidence ↗</a></p>}<div className="d-flex gap-2 mt-auto"><button className="btn btn-sm btn-outline-primary" type="button" onClick={() => edit(item)}>Edit</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => remove(item.id)}>Delete</button></div></article></div>)}</div>}
    <p className="small text-muted mt-4">Portfolio entries are saved in the Career Bridge database and are private to your signed-in student account. They are not yet publicly shared with recruiters or independently verified. Store links to evidence rather than sensitive documents.</p>
  </div></main>;
}
