import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ContentShell } from '../components/Layout/ContentShell';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import {
  buildTimelineFromProfile,
  filterEventsByType,
  EVENT_COLORS,
  type TimelineEvent,
  type EventType,
} from '../MatrixEngine/lifeMap/timelineBuilder';

export function LifeMapPage() {
  const { profile } = useVeteranProfile();
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([
    'Service',
    'Deployment',
    'Rating Decision',
    'Employment',
    'Education',
  ]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Build timeline from profile
  const allEvents = useMemo(() => {
    return buildTimelineFromProfile({
      enlistmentDate: profile.enlistmentDate,
      dischargeDate: profile.dischargeDate,
      branch: profile.branch,
      rank: profile.rank,
      mos: profile.mos,
      serviceConnectedConditions: profile.serviceConnectedConditions,
    });
  }, [profile]);

  // Filter by selected event types
  const filteredEvents = useMemo(() => {
    return filterEventsByType(allEvents, selectedEventTypes);
  }, [allEvents, selectedEventTypes]);

  const toggleEventType = (type: EventType) => {
    setSelectedEventTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="full" padding="large">
        {/* Header */}
        <div style={{ marginBottom: '2rem', maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            🗺️ Life Map
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>
            Your complete service and life timeline
          </p>
        </div>

        {/* Event Type Filters */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 2rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          {(Object.keys(EVENT_COLORS) as EventType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleEventType(type)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedEventTypes.includes(type) ? EVENT_COLORS[type] : '#FFFFFF',
                color: selectedEventTypes.includes(type) ? '#FFFFFF' : '#374151',
                border: `2px solid ${EVENT_COLORS[type]}`,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filteredEvents.length === 0 ? (
          <div style={{
            maxWidth: '600px',
            margin: '4rem auto',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '2px dashed #D1D5DB',
          }}>
            <p style={{ fontSize: '1.125rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              📅 No Events to Display
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
              Complete your profile in the wizard to see your life timeline
            </p>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            paddingTop: '2rem',
          }}>
            {/* Vertical Timeline Line */}
            <div style={{
              position: 'absolute',
              left: '60px',
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: '#E5E7EB',
            }} />

            {/* Events */}
            <div style={{ position: 'relative' }}>
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    marginBottom: '2rem',
                    position: 'relative',
                    paddingLeft: '120px',
                  }}
                >
                  {/* Date Label */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#6B7280',
                    textAlign: 'right',
                    width: '50px',
                  }}>
                    {event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>

                  {/* Event Marker */}
                  <div style={{
                    position: 'absolute',
                    left: '50px',
                    top: '8px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: EVENT_COLORS[event.type],
                    borderRadius: '50%',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 0 0 4px ' + EVENT_COLORS[event.type] + '40',
                  }} />

                  {/* Event Card */}
                  <div
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderLeft: `4px solid ${EVENT_COLORS[event.type]}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedEvent?.id === event.id
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEvent?.id !== event.id) {
                        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                        {event.title}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: EVENT_COLORS[event.type],
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        fontWeight: 500,
                      }}>
                        {event.type}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.5rem 0' }}>
                      {event.description}
                    </p>

                    {event.location && (
                      <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                        📍 {event.location}
                      </div>
                    )}

                    {event.endDate && (
                      <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                        Duration: {event.date.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                      </div>
                    )}

                    {selectedEvent?.id === event.id && event.metadata && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #E5E7EB',
                      }}>
                        {Object.entries(event.metadata).map(([key, value]) => (
                          value && (
                            <div key={key} style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                              <strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Today Marker */}
            <div style={{
              marginTop: '2rem',
              paddingLeft: '120px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#3B82F6',
                textAlign: 'right',
                width: '50px',
              }}>
                Today
              </div>
              <div style={{
                position: 'absolute',
                left: '50px',
                top: '8px',
                width: '24px',
                height: '24px',
                backgroundColor: '#3B82F6',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: '0 0 0 4px #3B82F640',
              }} />
            </div>
          </div>
        )}

        {/* Educational Disclaimer */}
        <div style={{
          maxWidth: '1200px',
          margin: '3rem auto 0',
          padding: '1rem',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#92400E',
        }}>
          <strong>📚 Educational Tool:</strong> Your Life Map visualizes key events from your profile.
          Click events to see more details. You can add custom events in future updates.
        </div>
      </ContentShell>
    </AppLayout>
  );
}
