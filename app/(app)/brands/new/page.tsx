import { BrandOnboardingWizard } from "@/components/brand/BrandOnboardingWizard";

export default function NewBrandPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Set up your brand</h1>
        <p className="text-gray-500 mt-2">
          This takes about 3 minutes. We&apos;ll use this to create perfectly on-brand content.
        </p>
      </div>
      <BrandOnboardingWizard />
    </div>
  );
}
