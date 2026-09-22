import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import AdManager from "../components/ads/AdManager";

function Advertisements() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Advertisements"
        subtitle="Manage banners and sponsored placements"
      />
      <AdManager />
    </DashboardLayout>
  );
}

export default Advertisements;
