import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA functionality
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((_registration) => {
          toast.success("App ready for you!");
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Add manifest link if not present
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = "/manifest.json";
      document.head.appendChild(manifestLink);
    }

    // Add theme color meta tag
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      themeColorMeta.content = "#00BFFF";
      document.head.appendChild(themeColorMeta);
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({
          accentColor: '#00BFFF',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          {/* <ScaffoldStarkAppWithProviders> */}
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <AppProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppProvider>
            </BrowserRouter>
          </TooltipProvider>
          {/* </ScaffoldStarkAppWithProviders> */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
