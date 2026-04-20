import CounselorSidebar from "@/components/CounselorSidebar";

export default function CounselorLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#d9edf8]">
      <div className="relative z-10 flex">
        <CounselorSidebar />
        <section className="ml-[160px] w-full">
          {children}
        </section>
      </div>
    </div>
  );
}