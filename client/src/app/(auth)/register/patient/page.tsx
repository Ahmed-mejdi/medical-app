import AuthForm from '@/components/AuthForm';

export default function PatientRegisterPage() {
  return (
    <div>
      <AuthForm userType="patient" isRegister />
    </div>
  );
} 