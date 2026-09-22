
import React from "react";function RoleManager() {
  const roles = [
    "Super Admin",
    "Admin",
    "Editor",
    "Author",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        Role Permissions
      </h2>

      {roles.map((role) => (
        <div
          key={role}
          className="border-b py-3"
        >
          {role}
        </div>
      ))}
    </div>
  );
}

export default RoleManager;