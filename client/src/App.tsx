import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AdminReviews from "@/pages/AdminReviews";
import Cart from "@/pages/Cart";
import Catalog from "@/pages/Catalog";
import Checkout from "@/pages/Checkout";
import DemoOrderTracking from "@/pages/DemoOrderTracking";
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
      <Route path={"/demo-order"} component={DemoOrderTracking} />
      <Route path={"/order-confirmation"} component={OrderConfirmation} />
      <Route path={"/account/orders/:orderNumber"} component={OrderDetail} />
      <Route path={"/account"} component={Account} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/reviews"} component={AdminReviews} />
      <Route path={"/about"} component={StaticPage} />
      <Route path={"/contact"} component={StaticPage} />
      <Route path={"/faq"} component={StaticPage} />
      <Route path={"/shipping"} component={StaticPage} />
      <Route path={"/returns"} component={StaticPage} />
      <Route path={"/privacy"} component={StaticPage} />
      <Route path={"/terms"} component={StaticPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
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
