import { useEffect, useState } from 'react';
import { applyToOpportunity, getOpportunities } from '../api/opportunityApi';

const initialForm = {
  degree: 'B.Tech',
  skills: 'Python, SQL, Excel',
  experience: 'Academic projects',
  projectDescription: '',
  suitability: '',
  resumeLink: '',
};

export default function OpportunitiesPage({ onBack, canApply = true }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const result = await getOpportunities();
        setOpportunities(result.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load opportunities.');
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openApplicationForm(opportunity) {
    setError('');
    setMessage('');
    setForm(initialForm);
    setSelectedOpportunity(opportunity);
  }

  function closeApplicationForm() {
    setSelectedOpportunity(null);
    setForm(initialForm);
  }

  async function handleApply(event) {
    event.preventDefault();

    if (!selectedOpportunity) return;

    setError('');
    setMessage('');
    setApplyingId(selectedOpportunity.id);

    try {
      const result = await applyToOpportunity(selectedOpportunity.id, {
        degree: form.degree.trim(),
        skills: form.skills.trim(),
        experience: form.experience,
        projectDescription: form.projectDescription.trim(),
        suitability: form.suitability.trim(),
        resumeLink: form.resumeLink.trim(),
      });

      setMessage(
        result?.message || 'Your application was submitted successfully.'
      );

      setAppliedIds((current) =>
        current.includes(selectedOpportunity.id)
          ? current
          : [...current, selectedOpportunity.id]
      );

      closeApplicationForm();
    } catch (requestError) {
      setError(
        requestError.message || 'Unable to submit your application.'
      );
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <main className="dashboard-page">
      <div className="container py-5">
        <button
          className="btn btn-link px-0 mb-3"
          type="button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        <div className="mb-4">
          <span className="text-muted">Available opportunities</span>
          <h1 className="h2 mb-0">Jobs and internships</h1>
          <p className="text-muted mt-2">
            Find opportunities that match your skills and submit your
            application with your project and experience details.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {loading && <p>Loading opportunities...</p>}

        {!loading && (
          <div className="row g-4">
            {opportunities.map((opportunity) => (
              <div className="col-lg-6" key={opportunity.id}>
                <article className="feature-card h-100">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <span className="badge text-bg-light text-uppercase small mb-2">
                        {opportunity.type}
                      </span>
                      <h2>{opportunity.title}</h2>
                    </div>

                    {opportunity.matchPercentage !== null &&
                      opportunity.matchPercentage !== undefined && (
                        <span className="badge bg-success-subtle text-success fs-6">
                          {opportunity.matchPercentage}% match
                        </span>
                      )}
                  </div>

                  <p className="text-muted mb-2">
                    {opportunity.companyName} • {opportunity.location}
                  </p>

                  <p className="mb-3">{opportunity.description}</p>

                  <p className="small text-muted mb-3">
                    Domain: {opportunity.domain}
                  </p>

                  <div className="mb-3">
                    <h3 className="h6">Required skills</h3>

                    <div className="d-flex flex-wrap gap-2">
                      {opportunity.requiredSkills?.length ? (
                        opportunity.requiredSkills.map((skill) => (
                          <span
                            key={`${opportunity.id}-${skill.name}`}
                            className="badge bg-primary-subtle text-primary"
                          >
                            {skill.name} • {skill.requiredProficiency}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">
                          No specific skills listed.
                        </span>
                      )}
                    </div>
                  </div>

                  {canApply && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={appliedIds.includes(opportunity.id)}
                      onClick={() => openApplicationForm(opportunity)}
                    >
                      {appliedIds.includes(opportunity.id)
                        ? 'Applied'
                        : 'Apply now'}
                    </button>
                  )}
                </article>
              </div>
            ))}
          </div>
        )}

        {!loading && opportunities.length === 0 && (
          <div className="alert alert-info mt-3">
            No opportunities are available right now.
          </div>
        )}

        {selectedOpportunity && (
          <div
            className="application-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-form-title"
          >
            <div className="application-modal">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="text-muted">Internship application</span>
                  <h2 className="h4 mb-1" id="application-form-title">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-muted mb-0">
                    {selectedOpportunity.companyName}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close application form"
                  onClick={closeApplicationForm}
                  disabled={applyingId !== null}
                />
              </div>

              <form onSubmit={handleApply}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="degree">
                    Degree
                  </label>
                  <input
                    className="form-control"
                    id="degree"
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="skills">
                    Skills
                  </label>
                  <input
                    className="form-control"
                    id="skills"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Python, SQL, Excel"
                    required
                    maxLength={2000}
                  />
                  <div className="form-text">
                    Separate your skills with commas.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="experience">
                    Experience
                  </label>
                  <select
                    className="form-select"
                    id="experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    required
                  >
                    <option value="No experience">
                      No prior experience
                    </option>
                    <option value="Academic projects">
                      Academic projects
                    </option>
                    <option value="Internship experience">
                      Internship experience
                    </option>
                    <option value="Work experience">
                      Work experience
                    </option>
                  </select>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="projectDescription"
                  >
                    Project description
                  </label>
                  <textarea
                    className="form-control"
                    id="projectDescription"
                    name="projectDescription"
                    rows="3"
                    value={form.projectDescription}
                    onChange={handleChange}
                    placeholder="Describe a project you have completed, the technologies used, and your contribution."
                    required
                    maxLength={5000}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="suitability">
                    Why are you suitable for this opportunity?
                  </label>
                  <textarea
                    className="form-control"
                    id="suitability"
                    name="suitability"
                    rows="3"
                    value={form.suitability}
                    onChange={handleChange}
                    placeholder="Explain how your skills and interests match this opportunity."
                    required
                    maxLength={5000}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="resumeLink">
                    Resume / portfolio link
                  </label>
                  <input
                    className="form-control"
                    type="url"
                    id="resumeLink"
                    name="resumeLink"
                    value={form.resumeLink}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                    maxLength={1000}
                  />
                  <div className="form-text">
                    Paste a shareable URL to your resume or portfolio.
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeApplicationForm}
                    disabled={applyingId !== null}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={applyingId === selectedOpportunity.id}
                  >
                    {applyingId === selectedOpportunity.id
                      ? 'Submitting...'
                      : 'Submit application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .application-overlay {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
          overflow-y: auto;
        }

        .application-modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
          border-radius: 16px;
          background: var(--bs-body-bg, #fff);
          color: var(--bs-body-color, #212529);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 576px) {
          .application-modal {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}