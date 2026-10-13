function Home({ onLogin, onRegister }) {
  return (
    <div>
      <nav className="navbar navbar-light bg-white border-bottom">
        <div className="container">
          <span className="navbar-brand fw-bold">Career Bridge</span>

          <div>
            <button className="btn btn-outline-primary me-2" type="button" onClick={onLogin}>
              Login
            </button>
            <button className="btn btn-primary" type="button" onClick={onRegister}>
              Register
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="container text-center">
          <h1>Connecting Students and Industry</h1>
          <p className="lead">Skills • Jobs • Internships • Placement</p>
          <p>
            Career Bridge provides a common platform for students, industries,
            academicians, and administrators.
          </p>
          <button className="btn btn-primary me-2" type="button" onClick={onLogin}>
            Login
          </button>
          <button className="btn btn-outline-primary" type="button" onClick={onRegister}>
            Register
          </button>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-4">Platform Users</h2>
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h5>Student</h5>
                <p>Manage skills, find jobs and internships, and apply directly.</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h5>Industry</h5>
                <p>Post opportunities and manage student applications.</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h5>Academician</h5>
                <p>Monitor skills and recommend suitable students.</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h5>Admin</h5>
                <p>Manage users, opportunities, and platform activities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;