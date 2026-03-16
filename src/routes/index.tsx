import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import MachineSpeedDetailPage from "../pages/plants-detail/MachineSpeedDetailPage";
import PlantsPage from "../pages/plants/PlantsPages";
import WeightCheckerIndicator from "../pages/plants-detail/WeightCheckerPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/plants/amg-diapers" replace />
      },
      {
        path: "/plants/:id",
        element: <MachineSpeedDetailPage />
      },
      {
        path:"/weightchecker",
        element: <WeightCheckerIndicator />
      }
    ]
  }
]);