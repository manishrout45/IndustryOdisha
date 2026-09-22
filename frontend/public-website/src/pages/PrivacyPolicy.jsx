import React from "react";
import MainLayout from "../layouts/MainLayout";

function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-5 sm:mb-8">
          Privacy Policy
        </h1>

        <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-3xl">
          Your privacy policy content goes here.
        </p>
      </div>
    </MainLayout>
  );
}

export default PrivacyPolicy;
