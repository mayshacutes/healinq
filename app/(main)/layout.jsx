import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      
      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 z-50 h-screen w-[87px]">
        <Sidebar />
      </div>

      {/* CONTENT */}
      <main className="ml-[87px] w-full min-h-screen bg-[#d4eefc] relative z-0">
        {children}
      </main>

    </div>
  );
}