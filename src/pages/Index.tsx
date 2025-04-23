import SymptomChecker from '@/components/symptom-checker/SymptomChecker';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col py-8 px-4 bg-gray-50">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-health-700">Empathetic Health Oracle</h1>
        <p className="text-lg text-gray-600 mt-2">
          A conversational symptom checker to help you understand potential health conditions
        </p>
      </header>
      
      <main className="flex-1 flex justify-center">
        <SymptomChecker />
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p className="max-w-xl mx-auto">
          <strong>IMPORTANT DISCLAIMER</strong>: This symptom checker is for informational purposes only and is not a qualified medical opinion. 
          Always consult with a healthcare professional for proper diagnosis and treatment of medical conditions.
        </p>
      </footer>
    </div>
  );
};

export default Index;
