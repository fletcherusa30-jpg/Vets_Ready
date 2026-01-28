/**
 * Local Resources Hub Page
 * VSOs, veteran organizations, attorneys, and events
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { findNearbyVSOs, getVSOTips } from '../MatrixEngine/local/vsoMatcher';
import { searchOrganizations } from '../MatrixEngine/local/orgMatcher';

const LocalPage: React.FC = () => {
  const [zipCode, setZipCode] = useState('12345');
  const vsos = findNearbyVSOs(zipCode);
  const orgs = searchOrganizations({});
  const tips = getVSOTips();

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Local Resources Hub</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Find VSOs, veteran organizations, and local support in your area
          </p>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your ZIP Code</label>
            <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '300px' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Veterans Service Organizations (VSOs)</h2>
          {vsos.map((vso) => (
            <div key={vso.id} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{vso.name}</h3>
              <div style={{ color: '#64748b', marginBottom: '16px' }}>{vso.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>Location</div>
                  <div style={{ color: '#475569' }}>
                    {vso.location.address}<br />
                    {vso.location.city}, {vso.location.state} {vso.location.zipCode}<br />
                    📞 {vso.location.phone}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>Hours & Availability</div>
                  <div style={{ color: '#475569' }}>
                    {vso.hours}<br />
                    {vso.appointmentRequired && '📅 Appointment required'}<br />
                    {vso.walkInsAccepted && '🚶 Walk-ins accepted'}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '500', marginBottom: '8px' }}>Services Offered</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {vso.services.map((service, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontSize: '14px' }}>
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              {vso.website && (
                <a href={vso.website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', padding: '10px 20px', background: '#2563eb', color: '#fff',
                  borderRadius: '6px', textDecoration: 'none', fontWeight: '500',
                }}>
                  Visit Website
                </a>
              )}
            </div>
          ))}

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '48px', marginBottom: '24px' }}>Veteran Organizations</h2>
          {orgs.map((org) => (
            <div key={org.id} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{org.name}</h3>
                <span style={{
                  padding: '4px 12px', background: '#dcfce7', color: '#166534',
                  borderRadius: '6px', fontSize: '14px', fontWeight: '500', height: 'fit-content',
                }}>
                  {org.cost}
                </span>
              </div>
              <div style={{ color: '#64748b', marginBottom: '4px' }}>{org.category}</div>
              <p style={{ color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>{org.description}</p>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '500', marginBottom: '8px' }}>Services</div>
                <ul style={{ paddingLeft: '24px' }}>
                  {org.services.map((service, idx) => (
                    <li key={idx} style={{ marginBottom: '4px', color: '#475569' }}>{service}</li>
                  ))}
                </ul>
              </div>
              {org.virtualOptions && (
                <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: '6px', display: 'inline-block' }}>
                  💻 Virtual options available
                </div>
              )}
            </div>
          ))}

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>VSO Tips</h3>
            {tips.map((tip, idx) => (
              <div key={idx} style={{
                padding: '12px 16px', background: '#f8fafc', borderRadius: '6px',
                borderLeft: '4px solid #2563eb', marginBottom: '12px', lineHeight: '1.6',
              }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default LocalPage;
