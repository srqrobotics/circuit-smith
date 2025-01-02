import React from 'react';
import LeftSidebar from '../Sidebar/LeftSidebar';
import RightSidebar from '../Sidebar/RightSidebar';
import Canvas from '../Canvas/Canvas';
import BottomPanel from '../BottomPanel/BottomPanel';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Canvas />
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
      
      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  );
} 