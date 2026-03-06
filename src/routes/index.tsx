import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PlantDetailPage from "../pages/plants-detail/PlantDetailPage";
import PlantsPage from "../pages/plants/PlantsPages";

export const router = createBrowserRouter([
    {
        element:<MainLayout/>,
        children: [
            { path: "/", element: <PlantsPage /> },
            { path: "/plants/:id", element: <PlantDetailPage /> },
        ]
    }
])