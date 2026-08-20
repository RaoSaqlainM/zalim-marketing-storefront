import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Cart from "@/pages/Cart";
import Catalog from "@/pages/Catalog";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import OrderDetail from "@/pages/OrderDetail";
import OrderConfirmation from "@/pages/OrderConfirmation";
import ProductDetail from "@/pages/ProductDetail";
import StaticPage from "@/pages/StaticPage";
import VehicleFinder from "@/pages/VehicleFinder";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/shop"} component={() => <Catalog mode="shop" />} />
      <Route path={"/vehicle-finder"} component={VehicleFinder} />
      <Route path={"/search"} component={() => <Catalog mode="search" />} />
      <Route path={"/collections"} component={() => <Catalog mode="categories" />} />
      <Route path={"/collections/:slug"} component={() => <Catalog mode="collection" />} />
      <Route path={"/brands"} component={() => <Catalog mode="brands" />} />
      <Route path={"/brands/:slug"} component={() => <Catalog mode="brand" />} />
      <Route path={"/products/:slug"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/order-confirmation"} component={OrderConfirmation} />
      <Route path={"/account/orders/:orderNumber"} component={OrderDetail} />
      <Route path={"/account"} component={Account} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/about"} component={StaticPage} />
      <Route path={"/contact"} component={StaticPage} />
      <Route path={"/faq"} component={StaticPage} />
      <Route path={"/shipping"} component={StaticPage} />
      <Route path={"/returns"} component={StaticPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
