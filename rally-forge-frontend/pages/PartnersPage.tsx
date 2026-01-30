import React from 'react'

export const PartnersPage: React.FC = () => {
  return (
    <div className="rallyforge-partners">
      <section className="bg-gradient-to-r from-rose-900 to-rose-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Rally Forge Partnership Engine</h1>
          <p className="text-xl text-rose-100">Connect with employers, sponsors, and partners. Revenue from business, not veterans.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-rose-900">
            <h2 className="text-2xl font-bold mb-4">🏢 For Employers</h2>
            <p className="text-gray-600 mb-6">Reach veteran talent. Post jobs. Build partnerships.</p>
            <div className="space-y-2 mb-6 text-gray-700">
              <p>✓ Post job listings</p>
              <p>✓ Reach veteran talent pool</p>
              <p>✓ Affordable pricing tiers</p>
              <p>✓ Featured listings & sponsorships</p>
            </div>
            <a href="#" className="bg-rose-900 text-white px-6 py-2 rounded font-bold hover:bg-rose-800">
              Employer Portal
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-rose-900">
            <h2 className="text-2xl font-bold mb-4">🤝 For Businesses</h2>
            <p className="text-gray-600 mb-6">Grow your business. Reach veterans. Premium features.</p>
            <div className="space-y-2 mb-6 text-gray-700">
              <p>✓ Featured business listings</p>
              <p>✓ Discount programs</p>
              <p>✓ Sponsorship opportunities</p>
              <p>✓ Analytics & engagement tracking</p>
            </div>
            <a href="#" className="bg-rose-900 text-white px-6 py-2 rounded font-bold hover:bg-rose-800">
              Business Portal
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-rose-900">
            <h2 className="text-2xl font-bold mb-4">💰 For Sponsors</h2>
            <p className="text-gray-600 mb-6">Amplify your mission impact. Sponsor the platform.</p>
            <div className="space-y-2 mb-6 text-gray-700">
              <p>✓ Brand visibility</p>
              <p>✓ Mission alignment</p>
              <p>✓ Impact tracking</p>
              <p>✓ Custom partnerships</p>
            </div>
            <a href="#" className="bg-rose-900 text-white px-6 py-2 rounded font-bold hover:bg-rose-800">
              Sponsorship Info
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-rose-900">
            <h2 className="text-2xl font-bold mb-4">📱 For Affiliates</h2>
            <p className="text-gray-600 mb-6">Revenue share. Partner with us. Scale your reach.</p>
            <div className="space-y-2 mb-6 text-gray-700">
              <p>✓ Revenue share model</p>
              <p>✓ Affiliate tools & tracking</p>
              <p>✓ No upfront costs</p>
              <p>✓ Marketing support</p>
            </div>
            <a href="#" className="bg-rose-900 text-white px-6 py-2 rounded font-bold hover:bg-rose-800">
              Affiliate Program
            </a>
          </div>
        </div>

        <div className="bg-rose-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-rose-900">Partnership Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { tier: 'Free', price: '$0', features: ['Basic listing', 'Community visibility', 'Mobile-friendly'] },
              { tier: 'Basic', price: '$10/mo', features: ['Premium listing', 'Analytics', 'Contact form'] },
              { tier: 'Featured', price: '$49/mo', features: ['Homepage featured', 'Advanced analytics', 'Sponsorship badge'] },
              { tier: 'Premium', price: '$99/mo', features: ['Top placement', 'Custom branding', 'Dedicated support'] },
            ].map((plan, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border border-rose-200 hover:shadow-lg transition">
                <h4 className="text-xl font-bold text-rose-900 mb-2">{plan.tier}</h4>
                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {plan.features.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


