import { useEffect, useState } from 'react';
import { getAssessmentQuestions, getMyAssessmentResults, submitAssessment } from '../api/assessmentApi';

const SKILLS = [
  'Java',
  'React',
  'SQL',
  'Python',
  'Data Visualization'
];
const OPTIONS = ['A', 'B', 'C', 'D'];

export default function SkillAssessmentPage({ onBack }) {
  const [skill, setSkill] = useState('Java');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadResults() {
    try {
      const response = await getMyAssessmentResults();
      setResults(response?.data || []);
    } catch (e) {
      setError(e.message || 'Could not load assessment history.');
    }
  }

  async function loadQuestions(selectedSkill = skill) {
    setLoading(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setLastResult(null);
    try {
      const response = await getAssessmentQuestions(selectedSkill);
      setQuestions(response?.data || []);
    } catch (e) {
      setError(e.message || 'Could not load questions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions('Java');
    loadResults();
    // Initial page load only; skill changes are handled by the selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSkillChange(event) {
    const nextSkill = event.target.value;
    setSkill(nextSkill);
    await loadQuestions(nextSkill);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (questions.some((question) => !answers[question.id])) {
      setError('Please answer every question before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = questions.map((question) => ({ questionId: question.id, selectedOption: answers[question.id] }));
      const response = await submitAssessment(skill, payload);
      setLastResult(response?.data || null);
      await loadResults();
    } catch (e) {
      setError(e.message || 'Assessment submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function optionText(question, option) {
    return question[`option${option}`];
  }

  return (
    <main className="dashboard-page">
      <div className="container py-5">
        <button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>← Back to dashboard</button>
        <div className="mb-4">
          <span className="text-muted">Measure your skills</span>
          <h1 className="h2 mb-1">Skill assessment</h1>
          <p className="text-muted">Answer the questions to get an automatically scored snapshot of your current knowledge.</p>
        </div>

        <section className="feature-card mb-4">
          <label className="form-label fw-semibold" htmlFor="assessment-skill">Choose an assessment</label>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <select id="assessment-skill" className="form-select" style={{ maxWidth: 260 }} value={skill} onChange={handleSkillChange} disabled={loading || submitting}>
              {SKILLS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <span className="small text-muted">{questions.length ? `${questions.length} questions` : 'Questions load from the backend'}</span>
          </div>
        </section>

        {error && <div className="alert alert-warning" role="alert">{error}</div>}
        {loading && <p role="status">Loading assessment questions…</p>}

        {!loading && questions.length > 0 && !lastResult && (
          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <section className="feature-card mb-3" key={question.id}>
                <div className="d-flex flex-wrap gap-2 justify-content-between mb-2">
                  <span className="badge text-bg-primary">Question {index + 1} of {questions.length}</span>
                  <span className="small text-muted">{question.difficulty || 'General'}</span>
                </div>
                <h2 className="h5">{question.questionText}</h2>
                <div className="d-grid gap-2 mt-3">
                  {OPTIONS.map((option) => (
                    <label className={`border rounded p-3 d-flex gap-2 align-items-start ${answers[question.id] === option ? 'border-primary bg-light' : ''}`} key={option}>
                      <input className="form-check-input mt-1" type="radio" name={`question-${question.id}`} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />
                      <span><strong>{option}.</strong> {optionText(question, option)}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit assessment'}
            </button>
            <span className="small text-muted ms-3">Answered {Object.keys(answers).length} of {questions.length}</span>
          </form>
        )}

        {lastResult && (
          <section className="feature-card mb-4" aria-live="polite">
            <span className="badge text-bg-success">Assessment completed</span>
            <h2 className="h3 mt-3">{lastResult.skill}: {Number(lastResult.percentage).toFixed(0)}%</h2>
            <p className="mb-1">Correct answers: {lastResult.correctAnswers} out of {lastResult.totalQuestions}</p>
            <p className="mb-3">Current level: <strong>{lastResult.level}</strong></p>
            <p className="text-muted small">This is an assessment result, separate from the proficiency level you enter in your profile.</p>
            <button className="btn btn-primary me-2" type="button" onClick={() => loadQuestions(skill)}>Retake assessment</button>
             <button
  className="btn btn-outline-secondary"
  type="button"
  onClick={() => {
    setLastResult(null);
    setSkill('Java');
    loadQuestions('Java');
  }}
>
  Choose another skill
</button>
          </section>
        )}

        <section className="feature-card mt-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div><h2 className="h4 mb-1">Your assessment history</h2><p className="text-muted small mb-0">Previous results saved to your account.</p></div>
            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={loadResults}>Refresh history</button>
          </div>
          {results.length === 0 ? <p className="text-muted mb-0">No assessments completed yet.</p> : (
            <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Skill</th><th>Score</th><th>Level</th><th>Date</th></tr></thead><tbody>
              {results.map((result) => <tr key={result.id}><td>{result.skill}</td><td>{Number(result.percentage).toFixed(0)}% ({result.correctAnswers}/{result.totalQuestions})</td><td>{result.level}</td><td>{result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '—'}</td></tr>)}
            </tbody></table></div>
          )}
        </section>
      </div>
    </main>
  );
}
