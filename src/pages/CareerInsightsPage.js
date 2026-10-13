
import { useEffect, useMemo, useState } from 'react';
import { getStudentSkills } from '../api/studentProfileApi';
import { getOpportunities } from '../api/opportunityApi';

const normalize = (value) =>
  String(value || '').trim().toLowerCase();

function getSkillNames(opportunity) {
  return (opportunity.requiredSkills || [])
    .map((skill) => ({
      name: String(skill.name || '').trim(),
      requiredProficiency: Number(skill.requiredProficiency ?? 1),
    }))
    .filter((skill) => skill.name);
}

function getRecommendation(name) {
  const skill = name.toLowerCase();

  if (skill.includes('sql')) {
    return 'Practise SQL queries, joins, grouping and subqueries using a real dataset.';
  }
  if (skill.includes('python')) {
    return 'Build a small Python project that cleans and analyses a real dataset.';
  }
  if (skill.includes('pandas') || skill.includes('numpy')) {
    return 'Practise data cleaning, transformations and numerical analysis in Python.';
  }
  if (skill.includes('visualization') || skill.includes('power bi')
      || skill.includes('tableau')) {
    return 'Create a dashboard with charts and explain the insights it reveals.';
  }
  if (skill.includes('excel')) {
    return 'Practise formulas, lookup functions, pivot tables and data cleaning.';
  }
  if (skill.includes('statistics')) {
    return 'Practise descriptive statistics, distributions and interpreting data.';
  }
  if (skill.includes('analysis') || skill.includes('analytics')) {
    return 'Analyse a real dataset, identify trends and present evidence-based findings.';
  }

  return `Learn the fundamentals of ${name}, then demonstrate your skills in a practical project.`;
}

export default function CareerInsightsPage({ onBack }) {
  const [skills, setSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getStudentSkills(), getOpportunities()])
      .then(([skillResult, opportunityResult]) => {
        if (!active) return;

        setSkills(Array.isArray(skillResult.data) ? skillResult.data : []);
        setOpportunities(
          Array.isArray(opportunityResult.data) ? opportunityResult.data : []
        );
      })
      .catch((e) => {
        if (active) {
          setError(e.message || 'Could not load career insights.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const insights = useMemo(() => {
    const skillMap = new Map();

    skills.forEach((skill) => {
      const key = normalize(skill.name);
      if (!key) return;

      skillMap.set(key, {
        name: skill.name,
        proficiency:
          skill.proficiency == null || skill.proficiency === ''
            ? null
            : Number(skill.proficiency),
      });
    });

    const demand = new Map();

    opportunities.forEach((opportunity) => {
      getSkillNames(opportunity).forEach((skill) => {
        const key = normalize(skill.name);
        const current = demand.get(key) || {
          name: skill.name,
          count: 0,
          required: 1,
        };

        current.count += 1;
        current.required = Math.max(
          current.required,
          skill.requiredProficiency
        );

        demand.set(key, current);
      });
    });

    const demanded = [...demand.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );

    const gaps = demanded
      .map((item) => {
        const profileSkill = skillMap.get(normalize(item.name));
        const level = profileSkill?.proficiency ?? null;

        return {
          ...item,
          level,
          missing: !profileSkill,
          gap:
            level == null
              ? item.required
              : Math.max(0, item.required - level),
        };
      })
      .filter(
        (item) =>
          item.missing ||
          item.level == null ||
          item.level < item.required
      )
      .sort(
        (a, b) =>
          b.count - a.count ||
          b.gap - a.gap ||
          a.name.localeCompare(b.name)
      );

    const ranked = opportunities
      .map((opportunity) => {
        const required = getSkillNames(opportunity);
        const matched = required.filter((skill) => {
          const profileSkill = skillMap.get(normalize(skill.name));

          return (
            profileSkill?.proficiency != null &&
            profileSkill.proficiency >= skill.requiredProficiency
          );
        });

        const percentage = required.length
          ? Math.round((matched.length / required.length) * 100)
          : null;

        return {
          ...opportunity,
          localMatch: percentage,
          matchedCount: matched.length,
          requiredCount: required.length,
          missingSkills: required.filter((skill) => {
            const profileSkill = skillMap.get(normalize(skill.name));

            return (
              !profileSkill ||
              profileSkill.proficiency == null ||
              profileSkill.proficiency < skill.requiredProficiency
            );
          }),
        };
      })
      .sort(
        (a, b) =>
          (b.localMatch ?? -1) - (a.localMatch ?? -1)
      );

    return { demanded, gaps, ranked };
  }, [skills, opportunities]);

  return (
    <main className="dashboard-page">
      <div className="container py-4 py-md-5">
        <button
          className="btn btn-link px-0 mb-3 text-decoration-none"
          type="button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        <section className="mb-4">
          <span className="badge rounded-pill text-bg-primary mb-2">
            CAREER DEVELOPMENT
          </span>
          <h1 className="display-6 fw-bold mb-2">
            Your Career Insights
          </h1>
          <p className="text-muted mb-0">
            Discover in-demand skills, identify what to improve and explore
            opportunities that align with your current skill profile.
          </p>
        </section>

        {loading && (
          <div className="feature-card p-4" role="status">
            Loading your career insights…
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-lg-3">
                <div className="feature-card h-100 p-3">
                  <div className="text-muted small">Skills in your profile</div>
                  <div className="display-6 fw-bold">{skills.length}</div>
                  <div className="small text-muted">Your listed skills</div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="feature-card h-100 p-3">
                  <div className="text-muted small">Opportunities</div>
                  <div className="display-6 fw-bold">
                    {opportunities.length}
                  </div>
                  <div className="small text-muted">Listings reviewed</div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="feature-card h-100 p-3">
                  <div className="text-muted small">Skills to develop</div>
                  <div className="display-6 fw-bold">
                    {insights.gaps.length}
                  </div>
                  <div className="small text-muted">
                    Based on listed requirements
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="feature-card h-100 p-3">
                  <div className="text-muted small">Skills in demand</div>
                  <div className="display-6 fw-bold">
                    {insights.demanded.length}
                  </div>
                  <div className="small text-muted">
                    Across current listings
                  </div>
                </div>
              </div>
            </div>

            <section className="feature-card p-3 p-md-4 mb-4">
              <h2 className="h4 fw-bold">Your skill development plan</h2>
              <p className="text-muted">
                Start with skills frequently requested by industry that are
                missing from your profile or below the required level.
              </p>

              {insights.gaps.length === 0 ? (
                <div className="alert alert-success mb-0">
                  No skill gaps were identified from the available listings.
                  Keep your profile updated and review new opportunities.
                </div>
              ) : (
                <div className="row g-3">
                  {insights.gaps.slice(0, 8).map((gap) => {
                    const level = gap.level;
                    const progress =
                      level == null
                        ? 0
                        : Math.max(0, Math.min(100, (level / 5) * 100));

                    return (
                      <div className="col-md-6" key={normalize(gap.name)}>
                        <article className="border rounded-3 p-3 h-100">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <h3 className="h5 fw-semibold mb-1">
                              {gap.name}
                            </h3>
                            <span className="badge text-bg-light flex-shrink-0">
                              {gap.count} {gap.count === 1 ? 'listing' : 'listings'}
                            </span>
                          </div>

                          <div className="small text-muted mb-2">
                            {gap.missing
                              ? 'Not added to your profile'
                              : level == null
                                ? 'Proficiency not recorded'
                                : `Your level: ${level}/5`}
                            {' · '}
                            Required: {gap.required}/5
                          </div>

                          <div
                            className="progress mb-3"
                            role="progressbar"
                            aria-label={`${gap.name} proficiency`}
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <div
                              className="progress-bar"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="small fw-semibold mb-1">
                            Recommended next step
                          </div>
                          <p className="small text-muted mb-0">
                            {getRecommendation(gap.name)}
                          </p>
                        </article>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="feature-card p-3 p-md-4 mb-4">
              <h2 className="h4 fw-bold">Skills employers request most</h2>
              <p className="text-muted">
                Number of current opportunity listings that mention each skill.
              </p>

              {insights.demanded.length === 0 ? (
                <p className="text-muted mb-0">
                  No required-skill data is available yet. Add skills to your
                  opportunity postings to build industry-demand insights.
                </p>
              ) : (
                <div className="row g-2">
                  {insights.demanded.slice(0, 12).map((skill) => (
                    <div className="col-6 col-md-4 col-lg-3" key={normalize(skill.name)}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="fw-semibold">{skill.name}</div>
                        <div className="small text-muted mt-1">
                          Requested by {skill.count}{' '}
                          {skill.count === 1 ? 'listing' : 'listings'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold mb-1">
                Opportunities for your skill profile
              </h2>
              <p className="text-muted mb-3">
                Ranked by the proportion of required skills meeting their
                listed proficiency levels.
              </p>

              {insights.ranked.length === 0 ? (
                <div className="alert alert-info">
                  No opportunities are available yet. Check back after
                  recruiters publish listings.
                </div>
              ) : (
                <div className="row g-3">
                  {insights.ranked.slice(0, 6).map((item) => (
                    <div
                      className="col-lg-6"
                      key={item.id ?? item.title}
                    >
                      <article className="feature-card p-3 p-md-4 h-100">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <span className="badge text-bg-light">
                            {item.type || 'Opportunity'}
                          </span>

                          {item.localMatch == null ? (
                            <span className="badge text-bg-secondary">
                              Match unavailable
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success">
                              {item.localMatch}% skill match
                            </span>
                          )}
                        </div>

                        <h3 className="h5 fw-bold mt-3 mb-2">
                          {item.title || 'Untitled opportunity'}
                        </h3>

                        <p className="text-muted small mb-3">
                          {item.companyName || 'Industry partner'}
                          {' · '}
                          {item.location || 'Location not specified'}
                        </p>

                        <p>
                          {item.description ||
                            'No description provided by the recruiter.'}
                        </p>

                        <div className="small mb-2">
                          <strong>
                            {item.matchedCount} of {item.requiredCount}
                          </strong>{' '}
                          required skills meet the listed proficiency.
                        </div>

                        {item.missingSkills.length > 0 && (
                          <div className="small text-muted">
                            <strong>Skills to work on: </strong>
                            {item.missingSkills
                              .slice(0, 4)
                              .map((skill) => skill.name)
                              .join(', ')}
                            {item.missingSkills.length > 4 ? '…' : ''}
                          </div>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="border rounded-3 p-3 small text-muted">
              <strong>How to interpret these insights:</strong> Skill matches
              are rule-based estimates using your saved skill levels and
              opportunity requirements. They do not verify eligibility,
              interests, assessment scores, application status or hiring
              outcomes. Learning suggestions are starting points, not verified
              course recommendations.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
