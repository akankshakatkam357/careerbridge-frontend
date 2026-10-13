import { useCallback, useEffect, useState } from 'react';
import { createProject, deleteProject, getMyProjects, updateProject } from '../api/projectApi';
import { getOpportunities } from '../api/opportunityApi';

const emptyForm = { title: '', domain: '', description: '' };

export default function AcademicianPage({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [trendError, setTrendError] = useState('');

  const loadProjects = useCallback(async () => {
    setError('');
    try {
      const result = await getMyProjects();
      setProjects(result.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  useEffect(() => {
    let active = true;
    getOpportunities().then((result) => { if (active) setOpportunities(result.data || []); })
      .catch((e) => { if (active) setTrendError(e.message || 'Could not load industry trends.'); });
    return () => { active = false; };
  }, []);

  const skillDemand = opportunities.reduce((map, opportunity) => {
    (opportunity.requiredSkills || []).forEach((skill) => {
      const key = String(skill.name || '').trim();
      if (key) map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, new Map());
  const topDemandedSkills = [...skillDemand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  function updateField(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  function startEdit(project) {
    setEditingId(project.id);
    setForm({ title: project.title || '', domain: project.domain || '', description: project.description || '' });
    setMessage(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function cancelEdit() { setEditingId(null); setForm(emptyForm); }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const result = editingId ? await updateProject(editingId, form) : await createProject(form);
      setMessage(result.message || (editingId ? 'Project updated.' : 'Project created.'));
      cancelEdit(); await loadProjects();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function removeProject(project) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setError(''); setMessage('');
    try { const result = await deleteProject(project.id); setMessage(result.message || 'Project deleted.'); if (editingId === project.id) cancelEdit(); await loadProjects(); }
    catch (e) { setError(e.message); }
  }

  return <main className="dashboard-page"><div className="container py-5">
    <button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>← Back to dashboard</button>
    <div className="mb-4"><span className="text-muted">Faculty workspace</span><h1 className="h2 mb-1">Academician collaboration portal</h1><p className="text-muted">Create and manage research ideas, academic-industry projects, and collaboration proposals.</p></div>
    <section className="feature-card mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div><h2 className="h4 mb-1">Industry skill-demand snapshot</h2><p className="text-muted mb-0">A live summary of skills listed in current Career Bridge opportunity postings.</p></div>
        <div className="text-md-end"><div className="display-6 fw-semibold">{opportunities.length}</div><div className="small text-muted">current opportunities</div></div>
      </div>
      {trendError && <div className="alert alert-warning mt-3 mb-0">{trendError}</div>}
      {!trendError && topDemandedSkills.length === 0 && <p className="text-muted mt-3 mb-0">No required-skill data is available in the current postings yet.</p>}
      {topDemandedSkills.length > 0 && <div className="row g-2 mt-2">{topDemandedSkills.map(([skill, count]) => <div className="col-sm-6 col-lg-3" key={skill}><div className="border rounded-3 p-3 h-100"><div className="fw-semibold">{skill}</div><div className="small text-muted">Listed in {count} posting{count === 1 ? '' : 's'}</div></div></div>)}</div>}
      <p className="small text-muted mt-3 mb-0">This snapshot reflects only postings currently stored in this portal; it is not external labor-market data or a full curriculum-gap assessment.</p>
    </section>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {message && <div className="alert alert-success" role="status">{message}</div>}
    <section className="feature-card mb-4"><h2 className="h4">{editingId ? 'Edit project' : 'Create collaboration project'}</h2>
      <form onSubmit={submit}><div className="row g-3">
        <div className="col-md-6"><label className="form-label" htmlFor="project-title">Project title</label><input id="project-title" className="form-control" name="title" value={form.title} onChange={updateField} required maxLength="150" /></div>
        <div className="col-md-6"><label className="form-label" htmlFor="project-domain">Domain / department</label><input id="project-domain" className="form-control" name="domain" value={form.domain} onChange={updateField} required maxLength="100" placeholder="AI, EEE, Data Analytics..." /></div>
        <div className="col-12"><label className="form-label" htmlFor="project-description">Project description</label><textarea id="project-description" className="form-control" name="description" rows="4" value={form.description} onChange={updateField} required maxLength="5000" placeholder="Describe the research, industrial problem, or collaboration opportunity." /></div>
      </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create project'}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit}>Cancel</button>}</div></form>
    </section>
    <div className="d-flex align-items-center justify-content-between mb-3"><h2 className="h4 mb-0">My projects</h2><span className="badge text-bg-light">{projects.length} total</span></div>
    {loading && <p>Loading projects…</p>}{!loading && projects.length === 0 && <div className="alert alert-info">No projects yet. Create your first collaboration project above.</div>}
    <div className="row g-3">{projects.map(project => <div className="col-12" key={project.id}><article className="feature-card"><div className="d-flex flex-wrap justify-content-between gap-3"><div className="flex-grow-1"><span className="badge text-bg-light mb-2">{project.domain}</span><h3 className="h5">{project.title}</h3><p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p><small className="text-muted">Posted by {project.postedByEmail}</small></div><div className="d-flex align-items-start gap-2"><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => startEdit(project)}>Edit</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeProject(project)}>Delete</button></div></div></article></div>)}</div>
  </div></main>;
}
