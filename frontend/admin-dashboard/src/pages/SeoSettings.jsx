import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import SeoSettingsComponent from "../components/seo/SeoSettings";

function SeoSettings() {
  return (
    <DashboardLayout>
      <PageHeader
        title="SEO settings"
        subtitle="Site-wide metadata, analytics IDs and crawl rules"
      />
      <SeoSettingsComponent />
    </DashboardLayout>
  );
}

export default SeoSettings;
