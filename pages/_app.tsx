import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { HeroSliderProvider } from "../context/HeroSliderContext";
import { ContentProvider } from "../context/ContentContext";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${montserrat.variable}`}>
      <HeroSliderProvider>
        <ContentProvider>
          <Component {...pageProps} />
        </ContentProvider>
      </HeroSliderProvider>
    </div>
  );
}

export default MyApp;
