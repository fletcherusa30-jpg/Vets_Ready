import React, { useState } from 'react';
import {
  Dependent,
  DependentSpouse,
  DependentChild,
  DependentParent,
  validateSpouseEligibility,
  validateChildEligibility,
  validateDependentParentEligibility,
  ChildEligibilityReason,
  canAddDependents
} from '../../services/VADependencyValidator';

interface DependentIntakeFormProps {
  veteranRating: number;
  existingDependents: Dependent[];
  onAddDependent: (dependent: Dependent) => void;
  onCancel: () => void;
}

export const DependentIntakeForm: React.FC<DependentIntakeFormProps> = ({
  veteranRating,
  existingDependents,
  onAddDependent,
  onCancel
}) => {
  const [dependentType, setDependentType] = useState<'spouse' | 'child' | 'parent' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Spouse form state
  const [spouseForm, setSpouseForm] = useState<Partial<DependentSpouse>>({
    type: 'spouse',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    marriageType: 'legal',
    marriageDate: '',
    marriageCertificateProvided: false,
    priorMarriageHistory: [],
    isCurrentlyDivorced: false,
    isCurrentlyRemarried: false,
    verificationStatus: 'not_started',
    requiredDocuments: []
  });

  // Child form state
  const [childForm, setChildForm] = useState<Partial<DependentChild>>({
    type: 'child',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: 'biological',
    isMarried: false,
    eligibilityReason: 'none',
    enrolledInSchool: false,
    isHelplessChild: false,
    isInHousehold: true,
    birthCertificateProvided: false,
    verificationStatus: 'not_started',
    requiredDocuments: []
  });

  // Parent form state
  const [parentForm, setParentForm] = useState<Partial<DependentParent>>({
    type: 'parent',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: 'biological',
    annualIncome: 0,
    expensesCovered: 0,
    verificationStatus: 'not_started',
    requiredDocuments: []
  });

  // Check eligibility gate
  const { canAdd: canAddDeps, reason: eligibilityReason } = canAddDependents(veteranRating);

  if (!canAddDeps) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Dependents</h3>
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
          <p className="font-bold text-red-900">❌ Ineligible to Add Dependents</p>
          <p className="text-red-700 mt-2">{eligibilityReason}</p>
          <p className="text-sm text-red-600 mt-3">
            VA requires a minimum 30% disability rating to claim dependents. Once your rating is increased to 30% or higher, you can add dependents and receive benefit increases.
          </p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!dependentType) {
    return (
      <DependentTypeSelector
        onSelectType={setDependentType}
        onCancel={onCancel}
      />
    );
  }

  if (dependentType === 'spouse') {
    return (
      <SpouseIntakeForm
        form={spouseForm}
        setForm={setSpouseForm}
        onSubmit={() => {
          const validation = validateSpouseEligibility(spouseForm as DependentSpouse, existingDependents.filter(d => d.type === 'spouse') as DependentSpouse[]);
          if (!validation.isEligible) {
            setValidationErrors(validation.failedRules);
            return;
          }
          onAddDependent(spouseForm as DependentSpouse);
        }}
        onBack={() => setDependentType(null)}
        errors={validationErrors}
      />
    );
  }

  if (dependentType === 'child') {
    return (
      <ChildIntakeForm
        form={childForm}
        setForm={setChildForm}
        onSubmit={() => {
          const validation = validateChildEligibility(childForm as DependentChild);
          if (!validation.isEligible) {
            setValidationErrors(validation.failedRules);
            return;
          }
          onAddDependent(childForm as DependentChild);
        }}
        onBack={() => setDependentType(null)}
        errors={validationErrors}
      />
    );
  }

  if (dependentType === 'parent') {
    return (
      <ParentIntakeForm
        form={parentForm}
        setForm={setParentForm}
        onSubmit={() => {
          const validation = validateDependentParentEligibility(parentForm as DependentParent);
          if (!validation.isEligible) {
            setValidationErrors(validation.failedRules);
            return;
          }
          onAddDependent(parentForm as DependentParent);
        }}
        onBack={() => setDependentType(null)}
        errors={validationErrors}
      />
    );
  }

  return null;
};

interface DependentTypeSelectorProps {
  onSelectType: (type: 'spouse' | 'child' | 'parent') => void;
  onCancel: () => void;
}

const DependentTypeSelector: React.FC<DependentTypeSelectorProps> = ({ onSelectType, onCancel }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Add Dependent</h3>
      <p className="text-gray-600 mb-6">Select the type of dependent you want to add:</p>

      <div className="space-y-3">
        <button
          onClick={() => onSelectType('spouse')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <h4 className="font-bold text-gray-900">👰 Spouse</h4>
          <p className="text-sm text-gray-600">Legally married or common-law spouse</p>
        </button>

        <button
          onClick={() => onSelectType('child')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <h4 className="font-bold text-gray-900">👶 Child</h4>
          <p className="text-sm text-gray-600">Biological, adopted, or stepchild (with age/enrollment requirements)</p>
        </button>

        <button
          onClick={() => onSelectType('parent')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <h4 className="font-bold text-gray-900">👴 Dependent Parent</h4>
          <p className="text-sm text-gray-600">Parent who depends on your financial support (income threshold applies)</p>
        </button>
      </div>

      <button
        onClick={onCancel}
        className="mt-6 w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
};

interface SpouseIntakeFormProps {
  form: Partial<DependentSpouse>;
  setForm: (form: Partial<DependentSpouse>) => void;
  onSubmit: () => void;
  onBack: () => void;
  errors: string[];
}

const SpouseIntakeForm: React.FC<SpouseIntakeFormProps> = ({ form, setForm, onSubmit, onBack, errors }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Spouse as Dependent</h3>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="font-bold text-red-900 mb-2">Please fix the following issues:</p>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
            <input
              type="text"
              value={form.firstName || ''}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Spouse's first name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
            <input
              type="text"
              value={form.lastName || ''}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Spouse's last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
          <input
            type="date"
            value={form.dateOfBirth || ''}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Marriage Type</label>
          <select
            value={form.marriageType || 'legal'}
            onChange={(e) => setForm({ ...form, marriageType: e.target.value as 'legal' | 'common_law' })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="legal">Legal Marriage</option>
            <option value="common_law">Common-Law Marriage (recognized by state)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Marriage Date</label>
          <input
            type="date"
            value={form.marriageDate || ''}
            onChange={(e) => setForm({ ...form, marriageDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            id="marriageCert"
            checked={form.marriageCertificateProvided || false}
            onChange={(e) => setForm({ ...form, marriageCertificateProvided: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="marriageCert" className="text-sm text-gray-900">
            Marriage certificate will be provided with application
          </label>
        </div>

        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <input
            type="checkbox"
            id="divorced"
            checked={form.isCurrentlyDivorced || false}
            onChange={(e) => setForm({ ...form, isCurrentlyDivorced: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="divorced" className="text-sm text-red-900">
            I am currently divorced from this spouse
          </label>
        </div>

        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <input
            type="checkbox"
            id="remarried"
            checked={form.isCurrentlyRemarried || false}
            onChange={(e) => setForm({ ...form, isCurrentlyRemarried: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="remarried" className="text-sm text-red-900">
            I am remarried to someone else
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Prior marriages:</strong> If this spouse was previously married, you may be asked to provide divorce decrees from those marriages.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface ChildIntakeFormProps {
  form: Partial<DependentChild>;
  setForm: (form: Partial<DependentChild>) => void;
  onSubmit: () => void;
  onBack: () => void;
  errors: string[];
}

const ChildIntakeForm: React.FC<ChildIntakeFormProps> = ({ form, setForm, onSubmit, onBack, errors }) => {
  const birthDate = form.dateOfBirth ? new Date(form.dateOfBirth) : null;
  const age = birthDate
    ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Child as Dependent</h3>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="font-bold text-red-900 mb-2">Please fix the following issues:</p>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
            <input
              type="text"
              value={form.firstName || ''}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Child's first name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
            <input
              type="text"
              value={form.lastName || ''}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Child's last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
          <input
            type="date"
            value={form.dateOfBirth || ''}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {age !== null && (
            <p className="text-xs text-gray-600 mt-1">Age: {age} years old</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Relationship</label>
          <select
            value={form.relationship || 'biological'}
            onChange={(e) => setForm({ ...form, relationship: e.target.value as 'biological' | 'adopted' | 'stepchild' })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="biological">Biological Child</option>
            <option value="adopted">Adopted Child</option>
            <option value="stepchild">Stepchild</option>
          </select>
        </div>

        {/* Age-based eligibility */}
        {age !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {age < 18 && (
              <p className="text-sm text-blue-900">
                ✓ <strong>Eligible:</strong> Child is under 18 years old
              </p>
            )}
            {age >= 18 && age <= 23 && (
              <div>
                <p className="text-sm text-blue-900 mb-2">
                  ⚠️ <strong>Ages 18-23:</strong> Child must be enrolled in school full-time to qualify
                </p>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={form.enrolledInSchool || false}
                    onChange={(e) => setForm({ ...form, enrolledInSchool: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enrolled in school full-time</span>
                </label>
                {form.enrolledInSchool && (
                  <input
                    type="text"
                    placeholder="School name"
                    value={form.schoolName || ''}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                )}
              </div>
            )}
            {age > 23 && (
              <div>
                <p className="text-sm text-blue-900 mb-2">
                  ⚠️ <strong>Over 23:</strong> Child may qualify only if "helpless" (permanently incapable before age 18)
                </p>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={form.isHelplessChild || false}
                    onChange={(e) => setForm({ ...form, isHelplessChild: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Child qualifies as "helpless child"</span>
                </label>
              </div>
            )}
          </div>
        )}

        {form.relationship === 'stepchild' && (
          <label className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              checked={form.isInHousehold || false}
              onChange={(e) => setForm({ ...form, isInHousehold: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-yellow-900">Stepchild is part of my household</span>
          </label>
        )}

        <label className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <input
            type="checkbox"
            checked={form.isMarried || false}
            onChange={(e) => setForm({ ...form, isMarried: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-red-900">Child is married</span>
        </label>

        <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={form.birthCertificateProvided || false}
            onChange={(e) => setForm({ ...form, birthCertificateProvided: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-blue-900">Birth/adoption certificate will be provided with application</span>
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface ParentIntakeFormProps {
  form: Partial<DependentParent>;
  setForm: (form: Partial<DependentParent>) => void;
  onSubmit: () => void;
  onBack: () => void;
  errors: string[];
}

const ParentIntakeForm: React.FC<ParentIntakeFormProps> = ({ form, setForm, onSubmit, onBack, errors }) => {
  const incomeThreshold = 16000; // Approximate 2024 threshold

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Dependent Parent</h3>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="font-bold text-red-900 mb-2">Please fix the following issues:</p>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
            <input
              type="text"
              value={form.firstName || ''}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Parent's first name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
            <input
              type="text"
              value={form.lastName || ''}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Parent's last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
          <input
            type="date"
            value={form.dateOfBirth || ''}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Relationship</label>
          <select
            value={form.relationship || 'biological'}
            onChange={(e) => setForm({ ...form, relationship: e.target.value as 'biological' | 'adoptive' | 'stepparent' })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="biological">Biological Parent</option>
            <option value="adoptive">Adoptive Parent</option>
            <option value="stepparent">Stepparent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Parent's Annual Income</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">$</span>
            <input
              type="number"
              value={form.annualIncome || 0}
              onChange={(e) => setForm({ ...form, annualIncome: parseInt(e.target.value) })}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <p className={`text-xs mt-2 ${(form.annualIncome || 0) > incomeThreshold ? 'text-red-600' : 'text-green-600'}`}>
            VA threshold: ${incomeThreshold.toLocaleString()}/year (2024 approximate)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Amount You Cover Annually</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">$</span>
            <input
              type="number"
              value={form.expensesCovered || 0}
              onChange={(e) => setForm({ ...form, expensesCovered: parseInt(e.target.value) })}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Annual financial support you provide</p>
        </div>

        <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={!!form.relationshipDocumentationFile}
            onChange={(e) => {
              if (e.target.checked) {
                setForm({ ...form, relationshipDocumentationFile: new File([], 'placeholder') });
              } else {
                setForm({ ...form, relationshipDocumentationFile: undefined });
              }
            }}
            className="w-4 h-4"
          />
          <span className="text-sm text-blue-900">Birth/adoption certificate will be provided</span>
        </label>

        <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={!!form.incomeCertificationFile}
            onChange={(e) => {
              if (e.target.checked) {
                setForm({ ...form, incomeCertificationFile: new File([], 'placeholder') });
              } else {
                setForm({ ...form, incomeCertificationFile: undefined });
              }
            }}
            className="w-4 h-4"
          />
          <span className="text-sm text-blue-900">Income documentation (tax return/income statement) will be provided</span>
        </label>

        <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={!!form.dependencyVerificationFile}
            onChange={(e) => {
              if (e.target.checked) {
                setForm({ ...form, dependencyVerificationFile: new File([], 'placeholder') });
              } else {
                setForm({ ...form, dependencyVerificationFile: undefined });
              }
            }}
            className="w-4 h-4"
          />
          <span className="text-sm text-blue-900">Documentation of financial support will be provided</span>
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
