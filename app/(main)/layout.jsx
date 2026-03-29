import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main className="ml-[0px] w-full min-h-screen bg-[#d4eefc]">
        {children}
      </main>

    </div>
  );
}