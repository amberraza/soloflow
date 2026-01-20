import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinancialStore = create(
    persist(
        (set) => ({
            wizardData: {
                caseBasics: {
                    plaintiff: '',
                    defendant: '',
                    county: '',
                    caseNumber: ''
                },
                income: {
                    grossMonthly: 0,
                    frequency: 'MONTHLY'
                },
                deductions: {
                    federalTax: 0,
                    stateTax: 0,
                    fica: 0,
                    healthInsurance: 0
                },
                expenses: {
                    housing: 0,
                    utilities: 0,
                    food: 0
                },
                childSupport: {
                    numChildren: 1,
                    motherOvernights: 182,
                    fatherOvernights: 183
                }
            },
            updateSection: (section, data) => set((state) => ({
                wizardData: {
                    ...state.wizardData,
                    [section]: { ...state.wizardData[section], ...data }
                }
            })),
            reset: () => set({ wizardData: {} }) // Should reset to initial structure
        }),
        {
            name: 'soloflow-wizard-storage', // name of the item in the storage (must be unique)
        }
    )
);

export default useFinancialStore;
