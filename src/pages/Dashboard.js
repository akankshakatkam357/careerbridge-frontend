import { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import StudentProfilePage from './StudentProfilePage';
import OpportunitiesPage from './OpportunitiesPage';
import MyApplicationsPage from './MyApplicationsPage';
import IndustryPage from './IndustryPage';
import AcademicianPage from './AcademicianPage';
import CareerInsightsPage from './CareerInsightsPage';
import StudentPortfolioPage from './StudentPortfolioPage';
import LearningProgramsPage from './LearningProgramsPage';
import SkillAssessmentPage from './SkillAssessmentPage';
import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS = {
  ROLE_STUDENT: 'Student',
  ROLE_INDUSTRY: 'Industry partner',
  ROLE_FACULTY: 'Academician',
  ROLE_ADMIN: 'Administrator',
};

// Cards shown on the Home (overview) screen
function getCards(role) {
  if (role === 'ROLE_STUDENT') {
    return [
      { view: 'profile', title: 'Student profile', text: 'Create your profile and add technical skills.' },
      { view: 'opportunities', title: 'Opportunities', text: 'Browse jobs and internships with skill matching.' },
      { view: 'applications', title: 'My applications', text: 'Track the status of everything you applied to.' },
      { view: 'insights', title: 'Skill gaps & career insights', text: 'Find skill gaps and rank opportunities against your current skills.' },
      { view: 'assessment', title: 'Skill assessment', text: 'Take a short technical assessment and track your results over time.' },
      { view: 'portfolio', title: 'Digital portfolio', text: 'Manage projects, certificates, internships and achievements.' },
      { view: 'learning', title: 'Learning programs', text: 'Explore learning resources related to your skill gaps and career goals.' },
    ];
  }

  if (role === 'ROLE_FACULTY') {
    return [
      { view: 'academician', title: 'Academic & industry projects', text: 'Create, edit, and manage research and collaboration projects.' },
      { view: 'opportunities', title: 'Opportunities', text: 'Explore industry jobs and internships.' },
      { view: 'academician', title: 'Industry skill trends', text: 'Review skills appearing in current industry opportunity listings.' },
    ];
  }

  if (role === 'ROLE_INDUSTRY') {
    return [
      { view: 'industry', title: 'Post & manage opportunities', text: 'Publish jobs or internships and review applicants.' },
      { view: 'opportunities', title: 'All opportunities', text: 'See everything currently on the platform.' },
    ];
  }

  return [
    { view: 'opportunities', title: 'Opportunities', text: 'Browse the jobs and internships on the platform.' },
  ];
}

// Short links shown in the top navigation bar
function getNavItems(role) {
  if (role === 'ROLE_STUDENT') {
    return [
      { view: 'profile', label: 'Profile' },
      { view: 'opportunities', label: 'Opportunities' },
      { view: 'applications', label: 'Applications' },
      { view: 'insights', label: 'Career insights' },
      { view: 'assessment', label: 'Assessment' },
      { view: 'portfolio', label: 'Portfolio' },
      { view: 'learning', label: 'Learning' },
    ];
  }

  if (role === 'ROLE_FACULTY') {
    return [
      { view: 'academician', label: 'My projects' },
      { view: 'opportunities', label: 'Opportunities' },
    ];
  }

  if (role === 'ROLE_INDUSTRY') {
    return [
      { view: 'industry', label: 'Manage postings' },
      { view: 'opportunities', label: 'Opportunities' },
    ];
  }

  return [{ view: 'opportunities', label: 'Opportunities' }];
}

export default function Dashboard({ onLogout }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const goHome = () => setActiveView('overview');

  function renderView() {
    if (activeView === 'profile') return <StudentProfilePage onBack={goHome} />;
    if (activeView === 'applications') return <MyApplicationsPage onBack={goHome} />;
    if (activeView === 'industry') return <IndustryPage onBack={goHome} />;
    if (activeView === 'academician') return <AcademicianPage onBack={goHome} />;
    if (activeView === 'insights') return <CareerInsightsPage onBack={goHome} />;
    if (activeView === 'portfolio') return <StudentPortfolioPage onBack={goHome} />;
    if (activeView === 'learning') return <LearningProgramsPage onBack={goHome} />;
    if (activeView === 'assessment') return <SkillAssessmentPage onBack={goHome} />;
    if (activeView === 'opportunities') {
      return <OpportunitiesPage onBack={goHome} canApply={user?.role === 'ROLE_STUDENT'} />;
    }

    return (
      <main className="dashboard-page">
        <div className="container py-5">
          <div className="mb-4">
            <span className="text-muted">
              Career Bridge workspace • {ROLE_LABELS[user?.role] || 'User'}
            </span>
            <h1 className="h3 mb-0">Welcome, {user?.fullName || user?.email || 'User'}</h1>
          </div>

          <div className="row g-4">
            {getCards(user?.role).map((card) => (
              <div className="col-md-6" key={card.view}>
                <button
                  className="feature-card feature-card--button w-100 text-start"
                  type="button"
                  onClick={() => setActiveView(card.view)}
                >
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <AppNavbar
        user={user}
        items={getNavItems(user?.role)}
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={onLogout}
      />
      {renderView()}
    </>
  );
}