import React from 'react';
import './home.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              <span>AURA</span>
            </div>
            <nav className="nav-links">
              <a href="#technology">Technology</a>
              <a href="#mission">Mission</a>
              <a href="#research">Research</a>
              <a href="#contact">Contact</a>
            </nav>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
                <span>OPEN SOURCE INITIATIVE</span>
              </div>
              <h1 className="hero-title">
                Democratizing
                <br />
                Retinal Health with
                <br />
                <span className="highlight">Ethical AI</span>
              </h1>
              <p className="hero-description">
                AURA provides instant, non-invasive screening for vascular
                <br />
                abnormalities and systemic health risks. Open-source,
                <br />
                accessible, and clinically accurate.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary">See How It Works</button>
                <button className="btn-secondary">Read the Research</button>
              </div>
              <div className="research-badge">
                <div className="avatars">
                  <img
                    src="https://via.placeholder.com/32"
                    alt="Researcher 1"
                  />
                  <img
                    src="https://via.placeholder.com/32"
                    alt="Researcher 2"
                  />
                  <img
                    src="https://via.placeholder.com/32"
                    alt="Researcher 3"
                  />
                </div>
                <span>Used by 500+ researchers globally</span>
              </div>
            </div>
            <div className="hero-image">
              <div className="analysis-card">
                <div className="retinal-scan">
                  <div className="scan-overlay">
                    <div className="scan-frame top-left"></div>
                    <div className="scan-frame top-right"></div>
                    <div className="scan-frame bottom-left"></div>
                    <div className="scan-frame bottom-right"></div>
                  </div>
                </div>
                <div className="result-panel">
                  <div className="result-header">
                    <span>ANALYSIS RESULT</span>
                    <span className="risk-indicator">⚠ Low Risk</span>
                  </div>
                  <div className="confidence-score">
                    <span className="score">99.2%</span>
                    <span className="label">Confidence Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Screening Technology */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Advanced Screening Technology</h2>
          <p className="section-subtitle">
            Our platform leverages cutting-edge deep learning to provide rapid,
            reliable
            <br />
            assessments of retinal health, designed for both clinical and field
            settings.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>AI Precision</h3>
              <p>
                State-of-the-art deep learning models trained on diverse global
                datasets for high accuracy across different demographics.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Global Access</h3>
              <p>
                Lightweight architecture optimized for low-bandwidth
                environments, ensuring healthcare equity in underserved regions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 11V7M9 7H15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>Privacy First</h3>
              <p>
                HIPAA compliant architecture processing data locally where
                possible, with ethically sourced and anonymized training data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="container">
          <div className="workflow-badge">WORKFLOW</div>
          <h2 className="section-title">From Scan to Insight in Seconds</h2>
          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 9L15 15M15 9L9 15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>1. Upload Retinal Scan</h3>
              <p>
                Securely upload fundus photography from any standard retinal
                camera or smartphone adapter.
              </p>
            </div>
            <div className="workflow-step">
              <div className="step-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12H15M12 9V15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>2. AI Analysis Processing</h3>
              <p>
                Our proprietary algorithms analyze vascular geometry, branching
                angles, and tortuosity instantly.
              </p>
            </div>
            <div className="workflow-step">
              <div className="step-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12H16M8 8H16M8 16H12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3>3. Receive Risk Report</h3>
              <p>
                Get a comprehensive, downloadable report identifying potential
                markers for diabetic retinopathy or CVD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission: Accessibility & Ethics</h2>
              <p>
                We are a non-profit organization dedicated to making early
                <br />
                detection tools available to everyone, regardless of location
                <br />
                or economic status. We believe healthcare is a human right,
                <br />
                and AI should be a tool for equity.
              </p>
              <div className="mission-buttons">
                <button className="btn-primary">Learn About Our Mission</button>
                <button className="btn-outline">Partner With Us</button>
              </div>
            </div>
            <div className="mission-badges">
              <div className="mission-badge-item">
                <div className="badge-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="badge-title">Non-Profit Model</div>
                  <div className="badge-subtitle">
                    Revenue reinvested in research
                  </div>
                </div>
              </div>
              <div className="mission-badge-item">
                <div className="badge-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="badge-title">Open Source</div>
                  <div className="badge-subtitle">
                    Code available for peer-review
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value cyan">50k+</div>
              <div className="stat-label">Scans Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value cyan">98%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value cyan">30+</div>
              <div className="stat-label">Countries Reached</div>
            </div>
            <div className="stat-item">
              <div className="stat-value cyan">100%</div>
              <div className="stat-label">Non-Profit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
                <span>AURA</span>
              </div>
              <p>
                Democratizing access to high-quality retinal health with ethical
                and open AI/ML platforms.
              </p>
            </div>
            <div className="footer-col">
              <h4>PLATFORM</h4>
              <ul>
                <li>
                  <a href="#technology">Technology</a>
                </li>
                <li>
                  <a href="#accuracy">Accuracy Report</a>
                </li>
                <li>
                  <a href="#api">API Documentation</a>
                </li>
                <li>
                  <a href="#studies">Clinical Studies</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>ORGANIZATION</h4>
              <ul>
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#team">Our Team</a>
                </li>
                <li>
                  <a href="#reports">Financial Reports</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>SUBSCRIBE</h4>
              <p>
                Get the latest updates on our research or volunteer
                opportunities
              </p>
              <form className="subscribe-form">
                <input type="email" placeholder="Email address" />
                <button type="submit" className="btn-primary">
                  Join
                </button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 AURA Non-Profit Organization. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
