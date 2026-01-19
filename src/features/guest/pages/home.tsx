import React from 'react';

const HomePage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F7FAFC]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#319795]/20 text-[#319795]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1A202C]">
              AURA
            </h2>
          </div>
          <nav className="hidden md:flex flex-1 justify-end items-center gap-8 mr-8">
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="#technology"
            >
              Technology
            </a>
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="#mission"
            >
              Mission
            </a>
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="#research"
            >
              Research
            </a>
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="#contact"
            >
              Contact
            </a>
          </nav>
          <button className="flex items-center justify-center rounded-lg bg-[#319795] px-5 py-2 text-sm font-bold text-white hover:bg-[#2C7A7B] transition-colors focus:ring-2 focus:ring-[#319795] focus:ring-offset-2">
            Get Started
          </button>
          <button className="md:hidden ml-4 p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-col gap-6 lg:gap-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#319795]/30 bg-[#EBF8FF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#319795] w-fit">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Open Source Initiative</span>
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-[#1A202C] sm:text-5xl lg:text-6xl">
                  Democratizing Retinal Health with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2C5282] to-[#319795]">
                    Ethical AI
                  </span>
                </h1>
                <p className="max-w-xl text-lg text-[#718096]">
                  AURA provides instant, non-invasive screening for vascular
                  abnormalities and systemic health risks. Open-source,
                  accessible, and clinically accurate.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="inline-flex h-12 items-center justify-center rounded-lg bg-[#319795] px-6 text-base font-bold text-white hover:bg-[#2C7A7B] transition-opacity">
                    See How It Works
                  </button>
                  <button className="inline-flex h-12 items-center justify-center rounded-lg border border-[#E2E8F0] bg-transparent px-6 text-base font-bold text-[#1A202C] hover:bg-gray-50 transition-colors">
                    Read the Research
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#718096] pt-2">
                  <div className="flex -space-x-2">
                    <div
                      className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://i.pravatar.cc/150?img=1')",
                      }}
                    ></div>
                    <div
                      className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://i.pravatar.cc/150?img=2')",
                      }}
                    ></div>
                    <div
                      className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://i.pravatar.cc/150?img=3')",
                      }}
                    ></div>
                  </div>
                  <span>Used by 500+ researchers globally</span>
                </div>
              </div>
              <div className="relative flex-1 lg:pl-10">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C5282] via-[#319795] to-[#1A365D] shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    data-alt="Abstract blue and teal data visualization representing retinal scan analysis"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQvJj5-5RCvY8IYCi8flBAIcoOn17PKUUWhYeyhvPswg9MC8Sh0-e_PNqkowy7wAfOknOPWU_jPTOUcwMjQ41qDwYmUQvzjUaSjSheu59lNCv0c_JShcj5yCYaiLd7Cg5nzydktmOMcrZln56KPJAduosyEDZRifEnJxSD035IQLns2wcVfVzb4py-HXozIEQEFxnuwCbB-DtDS2t_BieKdCp_EJVOTswflhTIjtN_0e9SOSs2L4losk5qWC99hbsIiKUR4hmTWuYr')",
                    }}
                  ></div>
                  {/* Floating UI Card overlay */}
                  <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-white backdrop-blur-sm p-5 shadow-lg border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase text-[#718096]">
                        Analysis Result
                      </span>
                      <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Low Risk
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-[#1A202C]">
                        99.2%
                      </span>
                      <span className="text-sm font-medium text-[#718096] mb-1">
                        Confidence Score
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#319795] rounded-full"
                        style={{ width: '99.2%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-[#F7FAFC] py-16 lg:py-24 border-y border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#1A202C] sm:text-4xl mb-4">
                Advanced Screening Technology
              </h2>
              <p className="text-lg text-[#718096]">
                Our platform leverages cutting-edge deep learning to provide
                rapid, reliable assessments of retinal health, designed for both
                clinical and field settings.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-8 transition-all hover:shadow-md hover:border-[#319795]/50">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#319795]/10 text-[#319795]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#1A202C]">
                  AI Precision
                </h3>
                <p className="text-[#718096] leading-relaxed">
                  State-of-the-art deep learning models trained on diverse
                  global datasets for high accuracy across different
                  demographics.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-8 transition-all hover:shadow-md hover:border-[#319795]/50">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#319795]/10 text-[#319795]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#1A202C]">
                  Global Access
                </h3>
                <p className="text-[#718096] leading-relaxed">
                  Lightweight architecture optimized for low-bandwidth
                  environments, ensuring healthcare equity in underserved
                  regions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-8 transition-all hover:shadow-md hover:border-[#319795]/50">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#319795]/10 text-[#319795]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#1A202C]">
                  Privacy First
                </h3>
                <p className="text-[#718096] leading-relaxed">
                  HIPAA compliant architecture processing data locally where
                  possible, with ethically sourced and anonymized training data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline / How it works */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2">
                Workflow
              </span>
              <h2 className="text-3xl font-bold text-[#1A202C] sm:text-4xl">
                From Scan to Insight in Seconds
              </h2>
            </div>
            <div className="relative">
              {/* Connecting line for desktop */}
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 border-t-2 border-dashed border-[#E2E8F0] hidden lg:block z-0"></div>
              <div className="grid gap-12 lg:grid-cols-3 lg:gap-8 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center bg-white p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#319795]/20 text-[#319795] shadow-sm mb-6">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-2">
                    1. Upload Retinal Scan
                  </h3>
                  <p className="text-sm text-[#718096] max-w-xs">
                    Securely upload fundus photography from any standard retinal
                    camera or smartphone adapter.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center bg-white p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#319795]/20 text-[#319795] shadow-sm mb-6">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-2">
                    2. AI Analysis Processing
                  </h3>
                  <p className="text-sm text-[#718096] max-w-xs">
                    Our proprietary algorithms analyze vascular geometry,
                    branching angles, and tortuosity instantly.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center bg-white p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#319795]/20 text-[#319795] shadow-sm mb-6">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-2">
                    3. Receive Risk Report
                  </h3>
                  <p className="text-sm text-[#718096] max-w-xs">
                    Get a comprehensive, downloadable report identifying
                    potential markers for diabetic retinopathy or CVD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-[#F7FAFC] border-t border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C5282] to-[#1A365D] text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <svg
                  className="w-72 h-72"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="relative z-10 p-10 lg:p-16 flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl font-bold sm:text-4xl text-white">
                    Our Mission: Accessibility & Ethics
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                    We are a non-profit organization dedicated to making early
                    detection tools available to everyone, regardless of
                    location or economic status. We believe healthcare is a
                    human right, and AI should be a tool for equity.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button className="flex items-center justify-center rounded-lg bg-[#319795] px-6 py-3 text-base font-bold text-white hover:bg-[#2C7A7B] transition-opacity w-fit">
                      Learn About Our Mission
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-gray-600 bg-transparent px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors w-fit">
                      Partner With Us
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto flex justify-center md:justify-end">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-sm w-full">
                    <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                      <svg
                        className="w-8 h-8 text-[#319795]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-bold text-white">
                          Non-Profit Model
                        </h4>
                        <p className="text-sm text-gray-300">
                          Revenue reinvested in research
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg
                        className="w-8 h-8 text-[#319795]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      <div>
                        <h4 className="font-bold text-white">Open Source</h4>
                        <p className="text-sm text-gray-300">
                          Code available for peer review
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Trust Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#E2E8F0]">
              <div className="p-4">
                <div className="text-4xl font-black text-[#319795] mb-2">
                  50k+
                </div>
                <div className="text-sm font-medium text-[#718096]">
                  Scans Analyzed
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-black text-[#319795] mb-2">
                  98%
                </div>
                <div className="text-sm font-medium text-[#718096]">
                  Accuracy Rate
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-black text-[#319795] mb-2">
                  30+
                </div>
                <div className="text-sm font-medium text-[#718096]">
                  Countries Reached
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-black text-[#319795] mb-2">
                  100%
                </div>
                <div className="text-sm font-medium text-[#718096]">
                  Non-Profit
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F7FAFC] border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#319795]/20 text-[#319795]">
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
                </div>
                <h2 className="text-lg font-bold text-[#1A202C]">AURA</h2>
              </div>
              <p className="text-sm text-[#718096]">
                Democratizing access to high-quality retinal screening through
                ethical artificial intelligence.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1A202C]">
                Platform
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Technology
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Accuracy Data
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Clinical Studies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1A202C]">
                Organization
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Our Mission
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Financial Reports
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-[#718096] hover:text-[#2C5282]"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1A202C]">
                Subscribe
              </h3>
              <p className="mb-4 text-sm text-[#718096]">
                Get the latest updates on our research and global impact.
              </p>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1A202C] focus:border-[#319795] focus:outline-none focus:ring-1 focus:ring-[#319795]"
                  placeholder="Email address"
                  type="email"
                />
                <button className="rounded-md bg-[#319795] px-4 py-2 text-sm font-bold text-white hover:bg-[#2C7A7B]">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-[#E2E8F0] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#718096]">
              © 2024 AURA Non-Profit Organization. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs text-[#718096] hover:text-[#2C5282]"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-xs text-[#718096] hover:text-[#2C5282]"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-xs text-[#718096] hover:text-[#2C5282]"
                href="#"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
