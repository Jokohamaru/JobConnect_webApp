import { AICVWizard } from "@/components/cv-builder/ai/AICVWizard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AICVBuilderPage() {
  return (
    <AuthGuard requiredRole="CANDIDATE">
      <AICVWizard />
    </AuthGuard>
  );
}
