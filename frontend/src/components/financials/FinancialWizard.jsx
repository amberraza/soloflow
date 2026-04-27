import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import useFinancialStore from '../../store/useFinancialStore';
import Step1CaseBasics from '../wizard/Step1CaseBasics';
import Step2Income from '../wizard/Step2Income';
import Step3Deductions from '../wizard/Step3Deductions';
import Step4Expenses from '../wizard/Step4Expenses';
import Step5Custody from '../wizard/Step5Custody';
import RegistrationModal from '../wizard/RegistrationModal';
import WizardLayout from '../wizard/WizardLayout';

const FinancialWizard = ({ isWidget = false }) => {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success | error
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const wizardData = useFinancialStore((state) => state.wizardData);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleFinish = async () => {
    const token = localStorage.getItem('access_token');

    if (token) {
      setSubmitState('loading');
      setSubmitError('');
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const freshWizardData = useFinancialStore.getState().wizardData;

        const response = await fetch(`${API_URL}/api/v1/intake/submit/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ wizard_data: freshWizardData })
        });

        if (response.ok) {
          setSubmitState('success');
          useFinancialStore.getState().reset();
          setTimeout(() => navigate('/dashboard'), 1200);
        } else if (response.status === 401) {
          // Token expired or invalid — offer to log in
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setSubmitState('error');
          setSubmitError('Session expired. Please log in again.');
        } else {
          try {
            const err = await response.json();
            setSubmitState('error');
            setSubmitError(err.error || err.detail || 'Failed to save case. Please try again.');
          } catch {
            setSubmitState('error');
            setSubmitError('Server error. Please try again later.');
          }
        }
      } catch (error) {
        setSubmitState('error');
        setSubmitError('Network error. Please check your connection and try again.');
      }
    } else {
      // Guest: Open Modal
      setIsModalOpen(true);
    }
  };

  const getStepTitle = (stepId) => {
    switch (stepId) {
      case 1: return "Case Basics";
      case 2: return "Income";
      case 3: return "Deductions";
      case 4: return "Expenses";
      case 5: return "Custody";
      default: return "";
    }
  };

  return (
    <div className="font-sans antialiased text-gray-900">
      <WizardLayout title={getStepTitle(step)} currentStep={step} isWidget={isWidget}>
        {step === 1 && <Step1CaseBasics onNext={nextStep} />}
        {step === 2 && <Step2Income onNext={nextStep} onPrev={prevStep} />}
        {step === 3 && <Step3Deductions onNext={nextStep} onPrev={prevStep} />}
        {step === 4 && <Step4Expenses onNext={nextStep} onPrev={prevStep} />}
        {step === 5 && <Step5Custody onNext={null} onPrev={prevStep} onFinish={handleFinish} submitState={submitState} submitError={submitError} />}

      {/* Global submit overlay for steps before the final one */}
      {submitState === 'loading' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 flex items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-lg font-medium text-slate-700">Saving your case...</span>
          </div>
        </div>
      )}

      {submitState === 'success' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-8 flex items-center gap-4">
            <CheckCircle2 className="text-green-500" size={28} />
            <span className="text-lg font-medium text-green-700">Case saved! Redirecting...</span>
          </div>
        </div>
      )}
      </WizardLayout>

      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FinancialWizard;
