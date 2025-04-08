import React, { useState } from "react";
import ComponentItem from "./ComponentItem";

const COMPONENTS = [
  { name: "Arduino Uno", icon: "/images/components/arduino-uno.png" },
  { name: "LED", icon: "/images/components/led.png" },
  { name: "Resistor", icon: "/images/components/resistor.png" },
  { name: "Pushbutton", icon: "/images/components/pushbutton.png" },
  { name: "Potentiometer", icon: "/images/components/potentiometer.png" },
  { name: "Capacitor", icon: "/images/components/capacitor.png" },
  { name: "Slideswitch", icon: "/images/components/slideswitch.png" },
  { name: "9V Battery", icon: "/images/components/9v-battery.png" },
  { name: "Coin Cell", icon: "/images/components/coin-cell.png" },
  { name: "Breadboard", icon: "/images/components/breadboard.png" },
  { name: "DC Motor", icon: "/images/components/dc-motor.png" },
  { name: "Micro Servo", icon: "/images/components/micro-servo.png" },
];

export default function ComponentsSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Basic");

  const filteredComponents = COMPONENTS.filter((component) =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (
    e: React.DragEvent,
    component: (typeof COMPONENTS)[0]
  ) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Components
          </h2>
          <select
            className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Basic</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500">
            🔍
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {filteredComponents.map((component) => (
            <ComponentItem
              key={component.name}
              name={component.name}
              icon={component.icon}
              onDragStart={(e) => handleDragStart(e, component)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
