import { useCallback, useEffect, useState } from 'react';
import { createOpportunity, getMyOpportunities } from '../api/opportunityApi';
import {
  getOpportunityApplications,
  updateApplicationStatus,
} from '../api/applicationApi';

const emptyForm = {
  title: '',
  description: '',
  domain: '',
  companyName: '',
  location: '',
  type: 'INTERNSHIP',
  skills: '',
};

function parseSkills(text) {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, level] = part.split(':').map((value) => value.trim());
      const parsedLevel = Number(level);

      return {
        name,
        requiredProficiency:
          Number.isFinite(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 5
            ? parsedLevel
            : 3,
      };
    });
}

function ApplicantDetails({ application }) {
  return (
    <div className="applicant-details mt-3">
      <h4 className="h6 mb-3">Application details</h4>

      <div className="row g-3">
        <div className="col-md-6">
          <span className="applicant-label">Degree</span>
          <p className="mb-0">{application.degree || 'Not provided'}</p>
        </div>

        <div className="col-md-6">
          <span className="applicant-label">Experience</span>
          <p className="mb-0">{application.experience || 'Not provided'}</p>
        </div>

        <div className="col-12">
          <span className="applicant-label">Skills</span>
          <p className="mb-0">{application.skills || 'Not provided'}</p>
        </div>

        <div className="col-12">
          <span className="applicant-label">Project description</span>
          <p className="mb-0 applicant-text">
            {application.projectDescription || 'Not provided'}
          </p>
        </div>

        <div className="col-12">
          <span className="applicant-label">Why the student is suitable</span>
          <p className="mb-0 applicant-text">
            {application.suitability || 'Not provided'}
          </p>
        </div>

        <div className="col-12">
          <span className="applicant-label">Resume / portfolio</span>
          {application.resumeLink &&
          /^https?:\/\//i.test(application.resumeLink) ? (
            <a
              href={application.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View resume / portfolio
            </a>
          ) : (
            <p className="mb-0">Not provided</p>
          )}
        </div>

        {application.coverLetter && (
          <div className="col-12">
            <span className="applicant-label">Additional message</span>
            <p className="mb-0 applicant-text">{application.coverLetter}</p>
          </div>
        )}

        <div className="col-12">
          <span className="applicant-label">Applied on</span>
          <p className="mb-0">
            {application.appliedAt
              ? new Date(application.appliedAt).toLocaleString()
              : 'Not available'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IndustryPage({ onBack }) {
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [openId, setOpenId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [expandedApplicantId, setExpandedApplicantId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  const loadOpportunities = useCallback(async () => {
    try {
      setError('');
      const result = await getMyOpportunities();
      setOpportunities(result.data || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your opportunities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setCreating(true);

    try {
      const { skills, ...rest } = form;

      const result = await createOpportunity({
        ...rest,
        requiredSkills: parseSkills(skills),
      });

      setMessage(result?.message || 'Opportunity posted successfully.');
      setForm(emptyForm);
      await loadOpportunities();
    } catch (requestError) {
      setError(requestError.message || 'Unable to post the opportunity.');
    } finally {
      setCreating(false);
    }
  }

  async function toggleApplicants(opportunityId) {
    setError('');
    setMessage('');

    if (openId === opportunityId) {
      setOpenId(null);
      setApplicants([]);
      setExpandedApplicantId(null);
      return;
    }

    setLoadingApplicants(true);
    setOpenId(opportunityId);
    setApplicants([]);
    setExpandedApplicantId(null);

    try {
      const result = await getOpportunityApplications(opportunityId);
      setApplicants(result.data || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load applications.');
      setOpenId(null);
    } finally {
      setLoadingApplicants(false);
    }
  }

  async function handleStatus(applicationId, status) {
    setError('');
    setMessage('');
    setUpdatingApplicationId(applicationId);

    try {
      const result = await updateApplicationStatus(applicationId, status);

      setApplicants((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, ...(result.data || {}), status }
            : application
        )
      );

      setMessage(
        status === 'APPROVED'
          ? 'Application approved successfully.'
          : 'Application rejected successfully.'
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to update application status.');
    } finally {
      setUpdatingApplicationId(null);
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
          <span className="text-muted">Recruiter workspace</span>
          <h1 className="h2 mb-1">Post and manage opportunities</h1>
          <p className="text-muted mb-0">
            Publish jobs and internships, review student applications, and
            manage applicant decisions.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <section className="feature-card mb-5">
          <h2 className="h4 mb-3">Post a new opportunity</h2>

          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="title" className="form-label">
                  Job / internship title
                </label>
                <input
                  id="title"
                  name="title"
                  className="form-control"
                  value={form.title}
                  onChange={updateField}
                  required
                  maxLength={200}
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="type" className="form-label">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="form-select"
                  value={form.type}
                  onChange={updateField}
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="JOB">Job</option>
                </select>
              </div>

              <div className="col-md-3">
                <label htmlFor="domain" className="form-label">
                  Domain
                </label>
                <input
                  id="domain"
                  name="domain"
                  className="form-control"
                  value={form.domain}
                  onChange={updateField}
                  placeholder="Data Analytics"
                  required
                  maxLength={200}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="companyName" className="form-label">
                  Company
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  className="form-control"
                  value={form.companyName}
                  onChange={updateField}
                  required
                  maxLength={200}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  className="form-control"
                  value={form.location}
                  onChange={updateField}
                  placeholder="Hyderabad / Remote"
                  required
                  maxLength={200}
                />
              </div>

              <div className="col-12">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="form-control"
                  value={form.description}
                  onChange={updateField}
                  required
                  maxLength={5000}
                />
              </div>

              <div className="col-12">
                <label htmlFor="skills" className="form-label">
                  Required skills
                </label>
                <input
                  id="skills"
                  name="skills"
                  className="form-control"
                  placeholder="Java:4, Spring:3, SQL:2 (skill:level from 1 to 5)"
                  value={form.skills}
                  onChange={updateField}
                />
                <div className="form-text">
                  Enter comma-separated skills. The default proficiency is 3
                  when no level is provided.
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary mt-3"
              type="submit"
              disabled={creating}
            >
              {creating ? 'Posting...' : 'Post opportunity'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="h4 mb-3">Your postings</h2>

          {loading && <p>Loading opportunities...</p>}

          {!loading && opportunities.length === 0 && (
            <div className="alert alert-info">
              You have not posted any opportunities yet.
            </div>
          )}

          {opportunities.map((opportunity) => (
            <article className="feature-card mb-4" key={opportunity.id}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <span className="badge text-bg-light text-uppercase small mb-2">
                    {opportunity.type}
                  </span>

                  <h3 className="h5 mb-1">{opportunity.title}</h3>

                  <p className="text-muted mb-2">
                    {opportunity.companyName} • {opportunity.location}
                  </p>

                  {opportunity.description && (
                    <p className="mb-2">{opportunity.description}</p>
                  )}

                  {opportunity.domain && (
                    <p className="small text-muted mb-0">
                      Domain: {opportunity.domain}
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-outline-primary"
                  type="button"
                  disabled={loadingApplicants && openId === opportunity.id}
                  onClick={() => toggleApplicants(opportunity.id)}
                >
                  {openId === opportunity.id
                    ? 'Hide applicants'
                    : 'View applicants'}
                </button>
              </div>

              {openId === opportunity.id && (
                <div className="mt-4">
                  <h4 className="h6 mb-3">Student applications</h4>

                  {loadingApplicants ? (
                    <p>Loading applications...</p>
                  ) : applicants.length === 0 ? (
                    <p className="text-muted mb-0">
                      No applications have been submitted for this opportunity
                      yet.
                    </p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {applicants.map((application) => (
                        <div
                          className="applicant-card"
                          key={application.id}
                        >
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                            <div>
                              <h5 className="h6 mb-1">
                                {application.studentName || 'Student'}
                              </h5>

                              <p className="small text-muted mb-2">
                                {application.studentEmail || 'No email provided'}
                              </p>

                              <span className="badge text-bg-secondary">
                                {application.status || 'PENDING'}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                type="button"
                                onClick={() =>
                                  setExpandedApplicantId((current) =>
                                    current === application.id
                                      ? null
                                      : application.id
                                  )
                                }
                              >
                                {expandedApplicantId === application.id
                                  ? 'Hide details'
                                  : 'Review application'}
                              </button>

                              <button
                                className="btn btn-sm btn-success"
                                type="button"
                                disabled={
                                  application.status === 'APPROVED' ||
                                  updatingApplicationId === application.id
                                }
                                onClick={() =>
                                  handleStatus(application.id, 'APPROVED')
                                }
                              >
                                {updatingApplicationId === application.id
                                  ? 'Updating...'
                                  : 'Approve'}
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                type="button"
                                disabled={
                                  application.status === 'REJECTED' ||
                                  updatingApplicationId === application.id
                                }
                                onClick={() =>
                                  handleStatus(application.id, 'REJECTED')
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </div>

                          {expandedApplicantId === application.id && (
                            <ApplicantDetails application={application} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>

      <style>{`
        .applicant-card {
          padding: 18px;
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 12px;
          background: var(--bs-body-bg, #fff);
          color: var(--bs-body-color, #212529);
        }

        .applicant-details {
          padding-top: 16px;
          border-top: 1px solid var(--bs-border-color, #dee2e6);
        }

        .applicant-label {
          display: block;
          margin-bottom: 5px;
          color: var(--bs-secondary-color, #6c757d);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .applicant-text {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
      `}</style>
    </main>
  );
}