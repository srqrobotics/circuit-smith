import React from 'react';

export default function SearchBar() {
  return (
    <div className="p-4 border-b border-gray-200">
      <input
        type="text"
        placeholder="Search components..."
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
  );
} 