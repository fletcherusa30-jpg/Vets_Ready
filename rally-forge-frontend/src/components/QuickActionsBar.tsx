/**
 * VETERAN QUICK ACTIONS BAR
 *
 * Global quick access to common actions.
 * Persistent across the app.
 *
 * INTEGRATIONS:
 * - Digital Twin (context for actions)
 * - All modules (deep links)
 * - GIE (triggers where relevant)
 */

import React, { useState } from 'react';
import { Upload, Plus, Search, Calculator, FileText, HelpCircle, Map, Gift } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  action: () => void;
  color: string;
  shortcut?: string;
}

interface QuickActionsBarProps {
  onUploadDocument: () => void;
  onAddCondition: () => void;
  onCheckBenefits: () => void;
  onOpenDiscounts: () => void;
  onOpenMissionPacks: () => void;
  onOpenCalculator: () => void;
  onOpenLayStatementBuilder: () => void;
  onOpenHelp: () => void;
  position?: 'top' | 'side';
  collapsed?: boolean;
}

export default function QuickActionsBar({
  onUploadDocument,
  onAddCondition,
  onCheckBenefits,
  onOpenDiscounts,
  onOpenMissionPacks,
  onOpenCalculator,
  onOpenLayStatementBuilder,
  onOpenHelp,
  position = 'top',
  collapsed = false,
}: QuickActionsBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const quickActions: QuickAction[] = [
    {
      id: 'upload-document',
      label: 'Upload Document',
      icon: Upload,
      description: 'Upload DD-214, rating letter, or medical records',
      action: onUploadDocument,
      color: '#3b82f6',
      shortcut: 'Ctrl+U',
    },
    {
      id: 'add-condition',
      label: 'Add Condition',
      icon: Plus,
      description: 'Add a service-connected condition',
      action: onAddCondition,
      color: '#10b981',
      shortcut: 'Ctrl+N',
    },
    {
      id: 'check-benefits',
      label: 'Check Benefits',
      icon: Search,
      description: 'Search available benefits',
      action: onCheckBenefits,
      color: '#8b5cf6',
    },
    {
      id: 'discounts',
      label: 'Discounts',
      icon: Gift,
      description: 'Find military discounts',
      action: onOpenDiscounts,
      color: '#f59e0b',
    },
    {
      id: 'mission-packs',
      label: 'Mission Packs',
      icon: Map,
      description: 'View guided action plans',
      action: onOpenMissionPacks,
      color: '#06b6d4',
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      description: 'VA disability calculator',
      action: onOpenCalculator,
      color: '#ec4899',
    },
    {
      id: 'lay-statement',
      label: 'Lay Statement',
      icon: FileText,
      description: 'Build a lay statement',
      action: onOpenLayStatementBuilder,
      color: '#14b8a6',
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      description: 'Get help and support',
      action: onOpenHelp,
      color: '#6b7280',
    },
  ];

  if (position === 'top') {
    return (
      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: isCollapsed ? '8px 24px' : '12px 24px',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              flex: 1,
            }}
          >
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  title={action.description}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isCollapsed ? '6px 12px' : '8px 16px',
                    backgroundColor: 'white',
                    border: `1px solid ${action.color}20`,
                    borderRadius: '8px',
                    color: action.color,
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = `${action.color}10`;
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 2px 8px ${action.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = `${action.color}20`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={16} />
                  {!isCollapsed && <span>{action.label}</span>}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
    );
  }

  // Side position
  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        padding: '12px',
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        width: isCollapsed ? '48px' : '200px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              title={action.description}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: 'white',
                border: `1px solid ${action.color}20`,
                borderRadius: '8px',
                color: action.color,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `${action.color}10`;
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.boxShadow = `0 2px 8px ${action.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = `${action.color}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{action.label}</span>}
            </button>
          );
        })}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
    </div>
  );
}
