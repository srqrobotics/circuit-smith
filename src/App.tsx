import { Outlet } from "react-router-dom";
import { FileProvider } from "../app/contexts/FileContext";
import { CoordinateProvider } from "../app/contexts/CoordinateContext";
import { ThemeProvider } from "../app/contexts/ThemeContext";
import { AutoRoutingProvider } from "../app/contexts/AutoRoutingContext";
import { ComponentProvider } from "../app/contexts/ComponentContext";
import { RightSidebarProvider } from "../app/contexts/RightSidebarContext";
import { CanvasRefreshProvider } from "../app/contexts/CanvasRefreshContext";
import Home from "../app/routes/home";
import ErrorBoundary from "./ErrorBoundary";

export default function App() {
  return (
    <ThemeProvider>
      <FileProvider>
        <CoordinateProvider>
          <AutoRoutingProvider>
            <ComponentProvider>
              <RightSidebarProvider>
                <CanvasRefreshProvider>
                  <Outlet />
                </CanvasRefreshProvider>
              </RightSidebarProvider>
            </ComponentProvider>
          </AutoRoutingProvider>
        </CoordinateProvider>
      </FileProvider>
    </ThemeProvider>
  );
}
