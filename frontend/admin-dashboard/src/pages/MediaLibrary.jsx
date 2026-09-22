import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import UploadMedia from "../components/media/UploadMedia";
import MediaTable from "../components/media/MediaTable";

function MediaLibrary() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Media library"
        subtitle="Upload and reuse images across stories"
      />
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <UploadMedia onUploaded={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-8">
          <MediaTable refreshKey={refreshKey} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MediaLibrary;
