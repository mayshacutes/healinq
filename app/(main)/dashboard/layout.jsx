import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Konten halaman */}
      <div className="flex-1 ml-[87px]"> {/* ml sesuai lebar sidebar */}
        {children}
      </div>
    </div>
  );
}