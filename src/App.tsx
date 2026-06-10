import { LoanFormProvider } from '@/hooks/useLoanForm';
import { WizardOrchestrator } from '@/components/wizard/WizardOrchestrator';

export default function App() {
  return (
    <LoanFormProvider>
      <WizardOrchestrator />
    </LoanFormProvider>
  );
}
