import React from "react";
import Layout from "../components/Layout/Layout";
import { FileProvider } from "../contexts/FileContext";
import { CoordinateProvider } from "../contexts/CoordinateContext";
import { AutoRoutingProvider } from "../contexts/AutoRoutingContext";
import { ComponentProvider } from "../contexts/ComponentContext";
import { RightSidebarProvider } from "../contexts/RightSidebarContext";
import { CanvasRefreshProvider } from "../contexts/CanvasRefreshContext";
import { ThemeProvider } from "../contexts/ThemeContext";

function MainAppPage() {
  return (
    // Wrap with ThemeProvider to ensure useTheme has access to context
    <ThemeProvider>
      <FileProvider>
        <CoordinateProvider>
          <AutoRoutingProvider>
            <ComponentProvider>
              <RightSidebarProvider>
                <CanvasRefreshProvider>
                  <Layout />
                </CanvasRefreshProvider>
              </RightSidebarProvider>
            </ComponentProvider>
          </AutoRoutingProvider>
        </CoordinateProvider>
      </FileProvider>
    </ThemeProvider>
  );
}

export default MainAppPage;
