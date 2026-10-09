import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import { Loading } from "./components/ui";
import Dashboard from "./pages/Dashboard";
import WasteGuide from "./pages/WasteGuide";
import Facilities from "./pages/Facilities";
import NewComplaint from "./pages/NewComplaint";
import ComplaintList from "./pages/ComplaintList";
import ComplaintDetail from "./pages/ComplaintDetail";
import Analytics from "./pages/Analytics";

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="waste-guide" element={<WasteGuide />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="complaints/new" element={<NewComplaint />} />
        <Route path="complaints/mine" element={<ComplaintList mode="mine" />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="manage/complaints" element={<ComplaintList mode="all" />} />
        <Route path="manage/analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
