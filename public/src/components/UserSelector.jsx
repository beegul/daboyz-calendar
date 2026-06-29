import React from "react";

export default function UserSelector({ users, selectedUserId, onSelectUser }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="user-select"
        className="text-sm font-medium text-gray-700"
      >
        Session User:
      </label>
      <select
        id="user-select"
        value={selectedUserId}
        onChange={(e) => onSelectUser(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        aria-label="Choose your session user"
      >
        <option value="">-- Select a user --</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
