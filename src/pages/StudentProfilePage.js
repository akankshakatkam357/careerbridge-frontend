
import { useEffect, useState } from 'react';
import {
  addStudentSkill,
  createStudentProfile,
  getStudentProfile,
  getStudentSkills,
} from '../api/studentProfileApi';
import { getMyAssessmentResults } from '../api/assessmentApi';

const initialProfile = {
  department: '',
  program: '',
};

const initialSkill = {
  name: '',
  proficiency: '3',
};

const supportedSkills = [
  'Java',
  'React',
  'SQL',
  'Python',
  'Data Visualization',
];

export default function StudentProfilePage({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [skillForm, setSkillForm] = useState(initialSkill);
  const [error, setError] = useState('');
  const [assessmentError, setAssessmentError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const profileResult = await getStudentProfile();
        setProfile(profileResult.data);

        const skillsResult = await getStudentSkills();
        setSkills(skillsResult.data || []);
      } catch (requestError) {
        if (!/not found/i.test(requestError.message)) {
          setError(requestError.message);
        }
      } finally {
        setLoading(false);
      }

      try {
        const assessmentResponse = await getMyAssessmentResults();
        setAssessmentResults(assessmentResponse.data || []);
      } catch (requestError) {
        setAssessmentError(requestError.message);
      }
    }

    loadStudentData();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const result = await createStudentProfile(profileForm);
      setProfile(result.data);
      setProfileForm(initialProfile);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleSkillSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const result = await addStudentSkill(skillForm);
      setSkills((current) => [...current, result.data]);
      setSkillForm(initialSkill);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  // Keep only the most recent assessment result for each skill.
  const latestResults = Object.values(
    assessmentResults.reduce((latest, result) => {
      const key = (result.skill || '').toLowerCase();
      if (!key) return latest;

      const previous = latest[key];

      if (
        !previous ||
        new Date(result.submittedAt) >= new Date(previous.submittedAt)
      ) {
        latest[key] = result;
      }

      return latest;
    }, {})
  );

  function getResultForSkill(skillName) {
    return latestResults.find(
      (result) =>
        result.skill.toLowerCase() === skillName.toLowerCase()
    );
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

        <h1 className="h2 mb-4">Student Skill Profile</h1>

        {loading && <p>Loading your profile...</p>}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {!profile && !loading && (
          <section className="feature-card mb-4">
            <h2>Create your profile</h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="department" className="form-label">
                    Department
                  </label>
                  <input
                    id="department"
                    className="form-control"
                    value={profileForm.department}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        department: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="program" className="form-label">
                    Program
                  </label>
                  <input
                    id="program"
                    className="form-control"
                    value={profileForm.program}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        program: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary mt-3" type="submit">
                Create profile
              </button>
            </form>
          </section>
        )}

        {profile && (
          <section className="feature-card mb-4">
            <h2>Your profile</h2>
            <p className="mb-1">
              <strong>Department:</strong> {profile.department}
            </p>
            <p className="mb-0">
              <strong>Program:</strong> {profile.program}
            </p>
          </section>
        )}

        {profile && (
          <section className="feature-card mb-4">
            <h2>Add a skill</h2>

            <form onSubmit={handleSkillSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label htmlFor="skillName" className="form-label">
                    Skill name
                  </label>
                  <input
                    id="skillName"
                    className="form-control"
                    value={skillForm.name}
                    onChange={(event) =>
                      setSkillForm({
                        ...skillForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="proficiency" className="form-label">
                    Proficiency
                  </label>
                  <select
                    id="proficiency"
                    className="form-select"
                    value={skillForm.proficiency}
                    onChange={(event) =>
                      setSkillForm({
                        ...skillForm,
                        proficiency: event.target.value,
                      })
                    }
                  >
                    <option value="1">1 - Beginner</option>
                    <option value="2">2 - Basic</option>
                    <option value="3">3 - Intermediate</option>
                    <option value="4">4 - Advanced</option>
                    <option value="5">5 - Expert</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                  >
                    Add skill
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4">
              <h3 className="h5">Current skills</h3>

              {skills.length === 0 ? (
                <p className="text-muted mb-0">
                  No skills added yet.
                </p>
              ) : (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="badge bg-primary rounded-pill fs-6 p-2"
                    >
                      {skill.name} • {skill.proficiency}/5
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="feature-card mb-4">
          <h2>Assessment Performance</h2>
          <p className="text-muted">
            Your latest assessment score for each skill.
          </p>

          {assessmentError && (
            <div className="alert alert-warning">
              Unable to load assessment results: {assessmentError}
            </div>
          )}

          {!assessmentError && latestResults.length === 0 && (
            <p className="text-muted">
              Complete a skill assessment to see your performance here.
            </p>
          )}

          {supportedSkills.map((skillName) => {
            const result = getResultForSkill(skillName);

            return (
              <div key={skillName} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{skillName}</strong>

                  {result ? (
                    <span className="fw-semibold">
                      {Number(result.percentage).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-muted">Not assessed</span>
                  )}
                </div>

                <div
                  className="progress"
                  role="progressbar"
                  aria-label={`${skillName} assessment score`}
                  aria-valuenow={
                    result
                      ? Math.max(
                          0,
                          Math.min(100, Number(result.percentage) || 0)
                        )
                      : 0
                  }
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: result
                        ? `${Math.max(
                            0,
                            Math.min(100, Number(result.percentage) || 0)
                          )}%`
                        : '0%',
                    }}
                  />
                </div>

                {result && (
                  <>
                    <small className="text-muted">
                      {result.correctAnswers} correct out of{' '}
                      {result.totalQuestions} questions
                    </small>

                    {Number(result.percentage) < 60 && (
                      <p className="text-warning mb-0 mt-1">
                        Improvement suggested: practise {skillName}
                        {' '}and retake the assessment.
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
