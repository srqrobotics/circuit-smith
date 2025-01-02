import React, { useState } from 'react';

export default function FileExplorer() {
  const [files] = useState([
    { id: '1', name: 'Circuit 1.circuit' },
    { id: '2', name: 'LED Blink.circuit' },
    { id: '3', name: 'Temperature Sensor.circuit' },
  ]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Files</h2>
      </div>
      <div className="p-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-gray-900 dark:text-gray-100"
          >
            📄 {file.name}
          </div>
        ))}
      </div>
    </div>
  );
} 