import React, { useState } from 'react';

const componentCategories = [
  {
    name: 'Microcontrollers',
    items: [
      { id: 'arduino-uno', name: 'Arduino Uno', icon: '🔲' },
      { id: 'raspberry-pi', name: 'Raspberry Pi', icon: '🔲' },
    ],
  },
  {
    name: 'Outputs',
    items: [
      { id: 'led', name: 'LED', icon: '💡' },
      { id: 'buzzer', name: 'Buzzer', icon: '🔊' },
    ],
  },
  {
    name: 'Resistors',
    items: [
      { id: 'resistor-10k', name: '10K Resistor', icon: '⚡' },
      { id: 'resistor-1k', name: '1K Resistor', icon: '⚡' },
    ],
  },
];

export default function ComponentLibrary() {
  return (
    <div className="flex-1 overflow-y-auto">
      {componentCategories.map((category) => (
        <Category key={category.name} {...category} />
      ))}
    </div>
  );
}

function Category({ name, items }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{name}</span>
        <span>{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="px-2 py-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-move text-gray-900 dark:text-gray-100"
              draggable
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 