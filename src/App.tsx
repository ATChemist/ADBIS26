import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './models/store';
import { PATHS } from './routes';
import { AppCanvas } from './views/layouts/AppCanvas';
import { HomeScreen } from './views/screens/HomeScreen';
import { BioDashboardScreen } from './views/screens/bioanalytiker/BioDashboardScreen';
import { BioTaskListScreen } from './views/screens/bioanalytiker/BioTaskListScreen';
import { BioTaskDetailScreen } from './views/screens/bioanalytiker/BioTaskDetailScreen';
import { BioCancelTaskScreen } from './views/screens/bioanalytiker/BioCancelTaskScreen';
import { PlannerOverviewScreen } from './views/screens/planner/PlannerOverviewScreen';
import { PlannerAssignmentScreen } from './views/screens/planner/PlannerAssignmentScreen';
import { PlannerChatScreen } from './views/screens/planner/PlannerChatScreen';
import { RequesterCreateScreen } from './views/screens/requester/RequesterCreateScreen';
import { RequesterConfirmScreen } from './views/screens/requester/RequesterConfirmScreen';
import { RequesterStatusScreen } from './views/screens/requester/RequesterStatusScreen';

export default function App() {
  return (
    <AppProvider>
      <AppCanvas>
        <Routes>
          <Route path={PATHS.home} element={<HomeScreen />} />
          <Route path={PATHS.bioDashboard} element={<BioDashboardScreen />} />
          <Route path={PATHS.bioTasks} element={<BioTaskListScreen />} />
          <Route path="/bio/opgaver/:taskId" element={<BioTaskDetailScreen />} />
          <Route path="/bio/opgaver/:taskId/afmeld" element={<BioCancelTaskScreen />} />
          <Route path={PATHS.plannerOverview} element={<PlannerOverviewScreen />} />
          <Route path={PATHS.plannerAssign} element={<PlannerAssignmentScreen />} />
          <Route path="/plan/beskeder/:taskId" element={<PlannerChatScreen />} />
          <Route path={PATHS.requesterCreate} element={<RequesterCreateScreen />} />
          <Route path="/rekvirent/kvittering/:taskId" element={<RequesterConfirmScreen />} />
          <Route path={PATHS.requesterStatus} element={<RequesterStatusScreen />} />
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Routes>
      </AppCanvas>
    </AppProvider>
  );
}
