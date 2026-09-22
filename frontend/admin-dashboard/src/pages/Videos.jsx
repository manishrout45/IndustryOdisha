import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import VideoManager from "../components/videos/VideoManager";

function Videos() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Videos"
        subtitle="Upload MP4/WebM files (max 120MB) for the homepage Videos section"
      />
      <VideoManager />
    </DashboardLayout>
  );
}

export default Videos;
