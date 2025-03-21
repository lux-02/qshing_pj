import "@/styles/globals.css";
import { AppProvider } from "@/app/context/AppContext";
import "@/app/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
