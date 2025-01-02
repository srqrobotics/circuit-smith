import React from 'react';
import SearchBar from './SearchBar';
import ComponentLibrary from './ComponentLibrary';
import FileExplorer from './FileExplorer';

export default function LeftSidebar() {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 min-h-0">
      <SearchBar />
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ComponentLibrary />
        <FileExplorer />
      </div>
    </div>
  );
} 