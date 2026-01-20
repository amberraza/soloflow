import React, { useState } from 'react';
import Step1CaseBasics from '../wizard/Step1CaseBasics';
import Step2Income from '../wizard/Step2Income';
import Step3Deductions from '../wizard/Step3Deductions';
import Step4Expenses from '../wizard/Step4Expenses';
import Step5Custody from '../wizard/Step5Custody';
import RegistrationModal from '../wizard/RegistrationModal';
import WizardLayout from '../wizard/WizardLayout';

const FinancialWizard = () => {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const openModal = () => setIsModalOpen(true);

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
      <WizardLayout title={getStepTitle(step)} currentStep={step}>
        {step === 1 && <Step1CaseBasics onNext={nextStep} />}
        {step === 2 && <Step2Income onNext={nextStep} onPrev={prevStep} />}
        {step === 3 && <Step3Deductions onNext={nextStep} onPrev={prevStep} />}
        {step === 4 && <Step4Expenses onNext={nextStep} onPrev={prevStep} />}
        {step === 5 && <Step5Custody onNext={null} onPrev={prevStep} onFinish={openModal} />}
      </WizardLayout>

      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FinancialWizard;
