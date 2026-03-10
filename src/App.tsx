import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BusinessProvider } from "@/contexts/BusinessContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import AIOperationsPage from "@/pages/AIOperationsPage";
import DiagnosisPage from "@/pages/DiagnosisPage";
import AISalesPage from "@/pages/AISalesPage";
import AIMarketingPage from "@/pages/AIMarketingPage";
import MarketingPage from "@/pages/MarketingPage";
import AIDesignPage from "@/pages/AIDesignPage";
import AIBusinessSupportPage from "@/pages/AIBusinessSupportPage";
import MarketResearchPage from "@/pages/MarketResearchPage";
import ConsultantPage from "@/pages/ConsultantPage";
import ReportsPage from "@/pages/ReportsPage";
import InstructionsPage from "@/pages/InstructionsPage";
import SavedPage from "@/pages/SavedPage";
import SettingsPage from "@/pages/SettingsPage";
import OperatorPage from "@/pages/OperatorPage";
import EnterprisePage from "@/pages/EnterprisePage";
import NotFound from "@/pages/NotFound";
// Phase 4: Generation flow pages
import DailyTasksPage from "@/pages/DailyTasksPage";
import WeeklyActionsPage from "@/pages/WeeklyActionsPage";
import ChecklistPage from "@/pages/ChecklistPage";
import ResponseScriptPage from "@/pages/ResponseScriptPage";
import ReRegistrationPage from "@/pages/ReRegistrationPage";
import PromotionPlanPage from "@/pages/PromotionPlanPage";
import DesignRequestPage from "@/pages/DesignRequestPage";
import CopyLayoutPage from "@/pages/CopyLayoutPage";
import DocumentDraftPage from "@/pages/DocumentDraftPage";
import ContractOrderPage from "@/pages/ContractOrderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BusinessProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/ai-assistant/daily-tasks" element={<DailyTasksPage />} />
              <Route path="/ai-assistant/weekly-actions" element={<WeeklyActionsPage />} />
              <Route path="/ai-assistant/checklist" element={<ChecklistPage />} />
              <Route path="/ai-operations" element={<AIOperationsPage />} />
              <Route path="/ai-operations/diagnosis" element={<DiagnosisPage />} />
              <Route path="/ai-sales" element={<AISalesPage />} />
              <Route path="/ai-sales/response-script" element={<ResponseScriptPage />} />
              <Route path="/ai-sales/re-registration" element={<ReRegistrationPage />} />
              <Route path="/ai-marketing" element={<AIMarketingPage />} />
              <Route path="/ai-marketing/copy" element={<MarketingPage />} />
              <Route path="/ai-marketing/promotion" element={<PromotionPlanPage />} />
              <Route path="/ai-design" element={<AIDesignPage />} />
              <Route path="/ai-design/request" element={<DesignRequestPage />} />
              <Route path="/ai-design/copy-layout" element={<CopyLayoutPage />} />
              <Route path="/ai-business-support" element={<AIBusinessSupportPage />} />
              <Route path="/ai-business-support/document-draft" element={<DocumentDraftPage />} />
              <Route path="/ai-business-support/contract-order" element={<ContractOrderPage />} />
              <Route path="/market-research" element={<MarketResearchPage />} />
              <Route path="/consultant" element={<ConsultantPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/instructions" element={<InstructionsPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/operator" element={<OperatorPage />} />
              <Route path="/enterprise" element={<EnterprisePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
