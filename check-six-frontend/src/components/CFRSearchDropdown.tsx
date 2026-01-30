/**
 * CFR Searchable Condition Dropdown Component
 *
 * Purpose: Searchable dropdown for selecting conditions with diagnostic codes
 * Features:
 * - Auto-complete search with fuzzy matching
 * - Displays diagnostic code + condition name
 * - Rating criteria preview on hover
 * - "Learn more" modal with full CFR details
 * - Integration with CFR Diagnostic Code Function
 *
 * Usage:
 * - Wizard disability entry
 * - Evidence Builder condition selection
 * - Claims page condition lookup
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  searchDiagnosticCode,
  getDiagnosticCodeDetails,
  getAvailableRatings,
  getEvidenceRequirements,
  getCrossReferences,
  getSpecialRules,
  findSecondaryOpportunities,
  type CFRCondition,
  type CFRSearchResult,
} from '@/MatrixEngine/catalogs/cfrDiagnosticCodeFunction';

interface CFRSearchDropdownProps {
  value?: string; // Selected diagnostic code
  onChange: (code: string, condition: CFRCondition) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function CFRSearchDropdown({
  value,
  onChange,
  placeholder = 'Search for condition or diagnostic code...',
  required = false,
  autoFocus = false,
  className = '',
}: CFRSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CFRSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<CFRCondition | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<CFRCondition | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with value if provided
  useEffect(() => {
    if (value) {
      const condition = getDiagnosticCodeDetails(value);
      if (condition) {
        setSelectedCondition(condition);
        setSearchQuery(`${condition.diagnosticCode} - ${condition.conditionName}`);
      }
    }
  }, [value]);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      return; // Wait for at least 2 characters
    }

    const results = searchDiagnosticCode(searchQuery, 8);
    setSearchResults(results);
    setIsOpen(true);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: CFRSearchResult) => {
    setSelectedCondition(result.condition);
    setSearchQuery(`${result.condition.diagnosticCode} - ${result.condition.conditionName}`);
    setIsOpen(false);
    onChange(result.condition.diagnosticCode, result.condition);
  };

  const handleClear = () => {
    setSelectedCondition(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleLearnMore = (condition: CFRCondition) => {
    setHoveredResult(condition);
    setShowModal(true);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {selectedCondition && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={`${result.condition.diagnosticCode}-${index}`}
              onMouseEnter={() => setHoveredResult(result.condition)}
              onMouseLeave={() => setHoveredResult(null)}
              className="relative"
            >
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {result.condition.diagnosticCode}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {result.condition.bodySystem}
                      </span>
                      {result.condition.isPresumptive && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Presumptive
                        </span>
                      )}
                    </div>
                    <div className="text-gray-900 font-medium mt-1">
                      {result.condition.conditionName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Ratings: {result.condition.minimumRating}% -{' '}
                      {result.condition.maximumRating}% • Match:{' '}
                      {result.matchScore}% ({result.matchType})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLearnMore(result.condition);
                    }}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Learn more
                  </button>
                </div>
              </button>

              {/* Hover Preview */}
              {hoveredResult?.diagnosticCode === result.condition.diagnosticCode && (
                <div className="absolute left-full top-0 ml-2 w-96 bg-white border border-gray-300 rounded-md shadow-xl p-4 z-60">
                  <h4 className="font-semibold text-gray-900 mb-2">Rating Criteria Preview</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(result.condition.ratingCriteria)
                      .slice(0, 3)
                      .map(([percentage, criteria]) => (
                        <div key={percentage} className="border-l-2 border-blue-500 pl-2">
                          <span className="font-semibold text-blue-600">{percentage}%:</span>
                          <p className="text-gray-700 mt-1">{criteria}</p>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Click "Learn more" for full details
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <p className="text-gray-600 text-sm">
            No conditions found for "{searchQuery}". Try:
          </p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• Searching by condition name (e.g., "PTSD", "knee pain")</li>
            <li>• Using diagnostic code (e.g., "9411", "5260")</li>
            <li>• Using synonyms (e.g., "sleep apnea", "flat feet")</li>
          </ul>
        </div>
      )}

      {/* Learn More Modal */}
      {showModal && hoveredResult && (
        <CFRConditionModal
          condition={hoveredResult}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ====================
// CFR Condition Modal
// ====================

interface CFRConditionModalProps {
  condition: CFRCondition;
  onClose: () => void;
}

function CFRConditionModal({ condition, onClose }: CFRConditionModalProps) {
  const availableRatings = getAvailableRatings(condition.diagnosticCode);
  const evidenceRequirements = getEvidenceRequirements(condition.diagnosticCode);
  const crossReferences = getCrossReferences(condition.diagnosticCode);
  const specialRules = getSpecialRules(condition.diagnosticCode);
  const secondaryOpportunities = findSecondaryOpportunities(condition.diagnosticCode);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'rgb(75, 83, 32)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>
            CFR Diagnostic Codes
          </h2>
          <button className="px-4 py-2 rounded-lg font-semibold hover:opacity-90" style={{ backgroundColor: 'rgb(255, 215, 0)', color: 'rgb(0, 0, 0)' }} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', borderLeftColor: 'rgb(255, 215, 0)' }}>
            <p className="text-sm" style={{ color: 'rgb(255, 255, 255)' }}>
              <strong>⚠️ Educational Information Only</strong><br />
              This tool provides educational information based on CFR Part 4 (38 CFR §4.1-4.150). It does <strong>not</strong> predict ratings, provide medical advice, or assist with claims. All rating decisions are made by the VA based on your medical evidence and examinations.
            </p>
          </div>
        </div>
        {/* ...existing code for rating criteria, evidence, etc. can be added below in future ... */}
      </div>
    </div>
  );
}
