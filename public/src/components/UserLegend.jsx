import React from "react";

export default function UserLegend({ users }) {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Users</h3>
      <div className="flex flex-wrap gap-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: user.color }}
              aria-label={`Color for ${user.name}`}
            />
            <span className="text-sm text-gray-700">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
