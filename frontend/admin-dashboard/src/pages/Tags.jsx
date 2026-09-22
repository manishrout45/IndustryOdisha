import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import TagForm from "../components/tags/TagForm";
import TagTable from "../components/tags/TagTable";

function Tags() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Tags"
        subtitle="Label stories for discovery and related articles"
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <TagForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-8">
          <TagTable refresh={refreshKey} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Tags;
