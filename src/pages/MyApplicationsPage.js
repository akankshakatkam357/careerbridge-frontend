import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';

const STATUS_STYLE = {
  PENDING: 'text-bg-warning',
  APPROVED: 'text-bg-success',
  REJECTED: 'text-bg-danger',
};

export default function MyApplicationsPage({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const result = await getMyApplications();
        setApplications(result.data || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="dashboard-page">
      <div className="container py-5">
        <button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>
          ← Back to dashboard
        </button>

        <h1 className="h2 mb-4">My applications</h1>

        {loading && <p>Loading your applications...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <div className="alert alert-info">You have not applied to anything yet.</div>
        )}

        <div className="row g-3">
          {applications.map((application) => (
            <div className="col-12" key={application.id}>
              <article className="feature-card d-flex justify-content-between align-items-center gap-3">
                <div>
                  <h2 className="h5 mb-1">
                    {application.opportunityTitle || `Application #${application.id}`}
                  </h2>
                  {application.appliedAt && (
                    <span className="small text-muted">
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span className={`badge ${STATUS_STYLE[application.status] || 'text-bg-secondary'}`}>
                  {application.status}
                </span>
              </article>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
