import { useEffect, useState } from 'react';
import { getStudentSkills } from '../api/studentProfileApi';
import { getOpportunities } from '../api/opportunityApi';
import { getMyAssessmentResults } from '../api/assessmentApi';

const PROGRAMS = [
  { id: 'excel-data', title: 'Spreadsheet analysis and data storytelling', provider: 'Career Bridge learning guide', skills: ['excel', 'data analysis', 'data visualization'], level: 'Beginner', format: 'Guided practice', duration: '2–3 weeks', url: 'https://support.microsoft.com/excel' },
  { id: 'python', title: 'Python programming foundations', provider: 'Career Bridge learning guide', skills: ['python', 'programming', 'pandas'], level: 'Beginner', format: 'Self-paced learning', duration: '3–4 weeks', url: 'https://docs.python.org/3/tutorial/' },
  { id: 'sql', title: 'SQL and relational databases', provider: 'Career Bridge learning guide', skills: ['sql', 'mysql', 'database'], level: 'Beginner–Intermediate', format: 'Practice exercises', duration: '2–3 weeks', url: 'https://www.w3schools.com/sql/' },
  { id: 'web', title: 'Web development with HTML, CSS and JavaScript', provider: 'Career Bridge learning guide', skills: ['javascript', 'react', 'html', 'css', 'web development'], level: 'Beginner', format: 'Build a small website', duration: '3–5 weeks', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  { id: 'java', title: 'Java and object-oriented programming', provider: 'Career Bridge learning guide', skills: ['java', 'spring boot', 'programming'], level: 'Beginner–Intermediate', format: 'Coding practice', duration: '3–5 weeks', url: 'https://dev.java/learn/' },
  { id: 'communication', title: 'Communication and interview preparation', provider: 'Career Bridge learning guide', skills: ['communication', 'presentation', 'problem solving'], level: 'All levels', format: 'Practice and reflection', duration: '1–2 weeks', url: 'https://www.ncs.gov.in/' },
  { id: 'git', title: 'Git, GitHub and collaborative workflows', provider: 'Career Bridge learning guide', skills: ['git', 'github', 'version control'], level: 'Beginner', format: 'Hands-on exercises', duration: '1–2 weeks', url: 'https://docs.github.com/en/get-started' },
];
const norm = (s) => String(s || '').toLowerCase().trim();

export default function LearningProgramsPage({ onBack }) {
  const [skills, setSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('careerBridgeLearningSaved') || '[]'); } catch { return []; } });
  useEffect(() => {
    let active = true;
    Promise.all([getStudentSkills(), getOpportunities(), getMyAssessmentResults()]).then(([s, o, a]) => { if (active) { setSkills(s.data || []); setOpportunities(o.data || []); setAssessmentResults(a.data || []); } }).catch((e) => { if (active) setError(e.message || 'Could not load recommendations.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const skillNames = [...skills.map((s) => norm(s.name)), ...opportunities.flatMap((o) => (o.requiredSkills || []).map((s) => norm(s.name)))];
  const latestAssessment = new Map();
  [...assessmentResults].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).forEach((result) => { const key = norm(result.skill); if (key && !latestAssessment.has(key)) latestAssessment.set(key, result); });
  const ranked = PROGRAMS.map((p) => {
    const topicMatches = p.skills.filter((topic) => skillNames.some((name) => name && (name.includes(topic) || topic.includes(name)))).length;
    const relatedAssessments = [...latestAssessment.values()].filter((result) => p.skills.some((topic) => norm(result.skill).includes(topic) || topic.includes(norm(result.skill))));
    const weakestScore = relatedAssessments.length ? Math.min(...relatedAssessments.map((result) => Number(result.percentage))) : null;
    const priority = weakestScore === null ? 0 : weakestScore < 50 ? 3 : weakestScore < 80 ? 2 : 0;
    return { ...p, relevance: topicMatches + priority, weakestScore, isAssessmentPriority: priority > 0 };
  }).sort((a, b) => b.relevance - a.relevance || a.title.localeCompare(b.title));
  function toggleSaved(id) { const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; setSaved(next); localStorage.setItem('careerBridgeLearningSaved', JSON.stringify(next)); }
  return <main className="dashboard-page"><div className="container py-5"><button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>← Back to dashboard</button><div className="mb-4"><span className="text-muted">Career development</span><h1 className="h2 mb-1">Learning programs</h1><p className="text-muted">Explore practical learning guides related to your skills and the requirements in current opportunity listings.</p></div>
    {loading && <p>Finding relevant learning guides…</p>}{error && <div className="alert alert-warning" role="alert">Live skill data could not be loaded: {error} Recommendations below are general learning guides.</div>}
    <div className="alert alert-info">These are curated external learning resources, not courses hosted or certified by Career Bridge. Recommendations use topic matches from your profile and current listings, plus your latest assessment scores when available.</div>
    <div className="row g-3">{ranked.map((program) => <div className="col-lg-6" key={program.id}><article className="feature-card h-100 d-flex flex-column"><div className="d-flex flex-wrap justify-content-between gap-2"><span className="badge bg-primary-subtle text-primary">{program.level}</span><span className="small text-muted">{program.duration}</span>{program.isAssessmentPriority && <span className="badge text-bg-warning">Priority from assessment</span>}</div><h2 className="h5 mt-3">{program.title}</h2><p className="text-muted small mb-2">{program.provider} · {program.format}</p><p className="mb-2">Topics: {program.skills.join(', ')}</p>{program.weakestScore !== null && <p className="small text-muted mb-3">Related assessment score: {program.weakestScore.toFixed(0)}%. {program.weakestScore < 50 ? 'Start with the fundamentals and practice the basics.' : program.weakestScore < 80 ? 'Review the weak areas and complete a hands-on exercise.' : 'Use this resource for revision or deeper practice.'}</p>}<div className="mt-auto d-flex flex-wrap gap-2"><a className="btn btn-primary btn-sm" href={program.url} target="_blank" rel="noreferrer">Open learning resource ↗</a><button className={`btn btn-sm ${saved.includes(program.id) ? 'btn-outline-success' : 'btn-outline-secondary'}`} type="button" onClick={() => toggleSaved(program.id)}>{saved.includes(program.id) ? 'Saved ✓' : 'Save for later'}</button></div></article></div>)}</div>
    <section className="feature-card mt-4"><h2 className="h5">Your saved learning guides</h2>{saved.length ? <ul className="mb-0">{PROGRAMS.filter((p) => saved.includes(p.id)).map((p) => <li key={p.id}>{p.title}</li>)}</ul> : <p className="text-muted mb-0">Save any learning guide to build your own learning list.</p>}</section>
  </div></main>;
}
