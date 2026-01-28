import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isProfileComplete } = useVeteranProfile();
  const [stats, setStats] = useState({
    veteransServed: 0,
    claimsAssisted: 0,
    benefitsUnlocked: 0,
    satisfactionRate: 0
  });
  const [showQuickStart, setShowQuickStart] = useState(false);

  useEffect(() => {
    // Animate stats on load
    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      let startTime: number | null = null;
      const step = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        callback(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    };

    animateValue(0, 12458, 2000, (value) => setStats(prev => ({ ...prev, veteransServed: value })));
    animateValue(0, 8734, 2000, (value) => setStats(prev => ({ ...prev, claimsAssisted: value })));
    animateValue(0, 15200000, 2000, (value) => setStats(prev => ({ ...prev, benefitsUnlocked: value })));
    animateValue(0, 97, 2000, (value) => setStats(prev => ({ ...prev, satisfactionRate: value })));
  }, []);

  const handleQuickStart = (destination: string) => {
    setShowQuickStart(false);
    navigate(destination);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Main Get Started Banner */}
      {!isProfileComplete() && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 border-4 border-yellow-400 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-start gap-6">
            <span className="text-7xl">🎖️</span>
            <div className="flex-1">
              <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg">
                Welcome, Veteran! Let's Get Started
              </h2>
              <p className="text-xl text-white mb-6 leading-relaxed">
                📄 <strong>Upload your VA rating decision</strong> OR manually add your disabilities<br />
                🔍 Smart search with <strong>70+ common conditions</strong><br />
                🎯 Get your personalized benefits dashboard in <strong>under 5 minutes</strong>
              </p>
              <Link
                to="/start"
                className="inline-flex items-center gap-3 px-10 py-5 bg-yellow-400 text-gray-900 font-black text-xl rounded-xl shadow-2xl hover:bg-yellow-300 transition-all transform hover:scale-110"
              >
                <span className="text-3xl">🚀</span>
                START NOW - Get Your Benefits
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Show Dashboard Link if Profile Complete */}
      {isProfileComplete() && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 border-4 border-green-300">
          <div className="flex items-start gap-6">
            <span className="text-7xl">✅</span>
            <div className="flex-1">
              <h3 className="text-3xl font-black text-white mb-3">Welcome Back!</h3>
              <p className="text-xl text-white mb-6">
                <strong>{profile.firstName},</strong> your benefits dashboard is ready with personalized recommendations based on your <strong>{profile.vaDisabilityRating}% rating</strong> and <strong>{profile.branch}</strong> service.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-green-700 font-black text-xl rounded-xl shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-110"
              >
                <span className="text-3xl">📊</span>
                View My Benefits Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* lassName="space-y-12">
      {/* Hero Section with American Flag Theme */}
      <section
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{ minHeight: '400px' }}
        role="banner"
      >
        {/* Animated American Flag Background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #002868 0%, #002868 46%, #BF0A30 46%, #BF0A30 53.84%, #FFFFFF 53.84%, #FFFFFF 61.54%, #BF0A30 61.54%, #BF0A30 69.23%, #FFFFFF 69.23%, #FFFFFF 76.92%, #BF0A30 76.92%, #BF0A30 84.61%, #FFFFFF 84.61%, #FFFFFF 92.31%, #BF0A30 92.31%, #BF0A30 100%)',
          animation: 'wave 3s ease-in-out infinite'
        }}>
          {/* Star Field */}
          <div className="absolute top-0 left-0 w-[40%] h-[46%]" style={{
            background: '#002868',
            backgroundImage: `
              radial-gradient(circle, white 2px, transparent 2px),
              radial-gradient(circle, white 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px, 50px 50px',
            backgroundPosition: '0 0, 25px 25px'
          }}></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center px-6 py-12 bg-black bg-opacity-40 backdrop-blur-sm">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-4" style={{
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
          }}>
            VetsReady
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg mb-8" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}>
            Serving Those Who Served
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              to="/benefits"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Navigate to Benefits Education Center"
              tabIndex={0}
            >
              Explore Benefits →
            </Link>
            <Link
              to="/retirement"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              aria-label="Navigate to Retirement and Budget Planner"
              tabIndex={0}
            >
              Plan Retirement →
            </Link>
            <button
              onClick={() => setShowQuickStart(true)}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg rounded-lg shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              aria-label="Get help from Veterans Service Organization"
              tabIndex={0}
            >
              Get Help →
            </button>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="bg-white rounded-xl shadow-xl p-8" role="region" aria-label="Platform Impact Metrics">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Our Impact</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Updated monthly • Advisory platform for veteran education</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-4xl font-black text-blue-900">{stats.veteransServed.toLocaleString()}</p>
            <p className="text-sm font-semibold text-blue-700 mt-2">Veterans Served</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-4xl font-black text-green-900">{stats.claimsAssisted.toLocaleString()}</p>
            <p className="text-sm font-semibold text-green-700 mt-2">Claims Assisted</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-300">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-4xl font-black text-yellow-900">${(stats.benefitsUnlocked / 1000000).toFixed(1)}M</p>
            <p className="text-sm font-semibold text-yellow-700 mt-2">Benefits Unlocked</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-300">
            <div className="text-5xl mb-3">⭐</div>
            <p className="text-4xl font-black text-red-900">{stats.satisfactionRate}%</p>
            <p className="text-sm font-semibold text-red-700 mt-2">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Core Tools Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-xl p-8" role="region" aria-label="Core Platform Tools">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your Mission-Critical Tools</h2>
        <p className="text-gray-600 text-center mb-8">Powerful resources to navigate your veteran benefits journey</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Claims Wizard Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Claims Wizard</h3>
            <p className="text-gray-600 mb-6">
              Explore service connection theories and prepare your claim strategy with AI-powered guidance
            </p>
            <Link
              to="/claims"
              className="block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Start Claims Wizard"
              tabIndex={0}
            >
              Start Claim Analysis →
            </Link>
          </div>

          {/* Evidence Analyzer Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Evidence Analyzer</h3>
            <p className="text-gray-600 mb-6">
              Upload your VA rating decision and analyze potential secondary conditions with intelligent review
            </p>
            <Link
              to="/evidence"
              className="block w-full text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-green-300"
              aria-label="Upload and analyze VA documents"
              tabIndex={0}
            >
              Analyze Documents →
            </Link>
          </div>

          {/* Benefits Tracker Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Benefits Tracker</h3>
            <p className="text-gray-600 mb-6">
              Monitor your benefit status and explore new opportunities across all VA programs
            </p>
            <Link
              to="/benefits"
              className="block w-full text-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-purple-300"
              aria-label="View Benefits Education Center"
              tabIndex={0}
            >
              Explore Benefits →
            </Link>
          </div>
        </div>
      </section>

      {/* VA Disability Calculator Teaser */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-xl p-8 border-l-4 border-orange-600" role="region" aria-label="VA Disability Calculator">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-8xl">🧮</div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">VA Disability Calculator</h2>
            <p className="text-gray-700 mb-4">
              Use our advisory calculator to estimate your combined rating and monthly compensation based on current VA payment rates
            </p>
            <p className="text-xs text-gray-500 italic mb-4">
              ⚠️ Disclaimer: This tool provides an estimate based on current VA payment rates. Actual payments may vary based on individual circumstances and official VA determinations.
            </p>
            <Link
              to="/benefits"
              className="inline-block px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
              aria-label="Access VA Disability Calculator"
              tabIndex={0}
            >
              Calculate My Rating →
            </Link>
          </div>
        </div>
      </section>

      {/* Resources & Information Section */}
      <section className="bg-white rounded-xl shadow-xl p-8" role="region" aria-label="Resources and Information">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Resources & Information</h2>
        <p className="text-gray-600 text-center mb-8">Expert guidance for every step of your veteran journey</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Benefits Education */}
          <Link
            to="/benefits"
            className="group border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer"
            aria-label="Access Benefits Education Center"
            tabIndex={0}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎓</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600">Benefits Education</h3>
            <p className="text-sm text-gray-600">
              Comprehensive guides covering disability, healthcare, education, and more
            </p>
          </Link>

          {/* Claims Assistance */}
          <Link
            to="/claims"
            className="group border-2 border-gray-200 hover:border-green-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer"
            aria-label="Get Claims Assistance"
            tabIndex={0}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📝</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-600">Claims Assistance</h3>
            <p className="text-sm text-gray-600">
              Step-by-step guidance for preparing and filing VA disability claims
            </p>
          </Link>

          {/* Appeals Wizard */}
          <div className="group border-2 border-gray-200 hover:border-purple-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">⚖️</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600">Appeals Wizard</h3>
            <p className="text-sm text-gray-600">
              Navigate the VA appeals process with expert guidance and timelines
            </p>
          </div>

          {/* VSO Directory */}
          <div className="group border-2 border-gray-200 hover:border-red-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎖️</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-red-600">VSO Directory</h3>
            <p className="text-sm text-gray-600">
              Find accredited Veterans Service Organizations in your area
            </p>
          </div>

          {/* Job Board */}
          <Link
            to="/jobs"
            className="group border-2 border-gray-200 hover:border-yellow-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer"
            aria-label="Browse Veteran Job Board"
            tabIndex={0}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">💼</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-yellow-600">Job Board</h3>
            <p className="text-sm text-gray-600">
              Veteran-friendly employment opportunities and career resources
            </p>
          </Link>

          {/* Housing Wizard */}
          <div className="group border-2 border-gray-200 hover:border-indigo-500 rounded-lg p-6 transition-all hover:shadow-xl cursor-pointer">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏠</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600">Housing Wizard</h3>
            <p className="text-sm text-gray-600">
              VA home loan guidance, adaptive housing grants, and resources
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Wizard Modal */}
      {showQuickStart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-start-title"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <h3 id="quick-start-title" className="text-3xl font-bold text-gray-900 mb-4">
              What brings you to VetsReady today?
            </h3>
            <p className="text-gray-600 mb-6">Select the option that best matches your needs</p>

            <div className="space-y-3">
              <button
                onClick={() => handleQuickStart(isProfileComplete() ? '/dashboard' : '/profile')}
                className="w-full text-left p-4 border-2 border-orange-200 bg-orange-50 hover:border-orange-500 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-300"
                tabIndex={0}
              >
                <span className="text-2xl mr-3">{isProfileComplete() ? '📊' : '🎯'}</span>
                <span className="font-bold text-gray-900">
                  {isProfileComplete() ? 'View my personalized benefits dashboard' : 'Complete my profile and see what I qualify for'}
                </span>
              </button>

              <button
                onClick={() => handleQuickStart('/benefits')}
                className="w-full text-left p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300"
                tabIndex={0}
              >
                <span className="text-2xl mr-3">📚</span>
                <span className="font-bold text-gray-900">Understand my benefits</span>
              </button>

              <button
                onClick={() => handleQuickStart('/claims')}
                className="w-full text-left p-4 border-2 border-gray-200 hover:border-green-500 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-300"
                tabIndex={0}
              >
                <span className="text-2xl mr-3">📝</span>
                <span className="font-bold text-gray-900">Help with a claim</span>
              </button>

              <button
                onClick={() => handleQuickStart('/retirement')}
                className="w-full text-left p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-4 focus:ring-purple-300"
                tabIndex={0}
              >
                <span className="text-2xl mr-3">💰</span>
                <span className="font-bold text-gray-900">Plan for retirement</span>
              </button>

              <button
                onClick={() => handleQuickStart('/jobs')}
                className="w-full text-left p-4 border-2 border-gray-200 hover:border-yellow-500 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-4 focus:ring-yellow-300"
                tabIndex={0}
              >
                <span className="text-2xl mr-3">💼</span>
                <span className="font-bold text-gray-900">Find a job</span>
              </button>
            </div>

            <button
              onClick={() => setShowQuickStart(false)}
              className="mt-6 w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
              tabIndex={0}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

