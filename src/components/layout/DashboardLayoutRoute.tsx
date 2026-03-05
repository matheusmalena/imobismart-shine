import DashboardLayout from './DashboardLayout';
import { Outlet } from 'react-router-dom';

export default function DashboardLayoutRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
