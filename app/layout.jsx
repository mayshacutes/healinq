import "./globals.css";
import { Poppins } from "next/font/google";
import Sidebar from "@/components/Sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "HealinQ",
  description: "Mental Health App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}
        <Sidebar />

        {/* CONTENT */}
        <div className="ml-[120px]">
          {children}
        </div>
      </body>
    </html>
  );
  
}
