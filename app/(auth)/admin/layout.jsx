import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#d9edf8]">
      <div className="relative z-10 flex">
        <AdminSidebar />
        <section className="ml-[160px] w-full">
          {children}
        </section>
      </div>
    </div>
  );
}