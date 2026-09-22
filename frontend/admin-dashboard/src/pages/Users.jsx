import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import UserTable from "../components/users/UserTable";
import UserForm from "../components/users/UserForm";

function Users() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Users & roles"
        subtitle="MongoDB login accounts and WordPress / MySQL authors"
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <UserForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-8">
          <UserTable refresh={refreshKey} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Users;
