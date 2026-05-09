import AppRoutes from "./routes";
import Navbar from "@layout/Navbar";
import Footer from "@layout/Footer";
import { ScrollProvider } from "@context/ScrollContext";

export default function App() {
  return (
    <ScrollProvider>
      <Navbar />
      <AppRoutes />
      <Footer />
    </ScrollProvider>
  );
}
