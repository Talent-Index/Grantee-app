import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { wagmiConfig } from '@/lib/wagmiConfig';

import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import GrantsPage from './pages/GrantsPage';
import HistoryPage from './pages/HistoryPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
