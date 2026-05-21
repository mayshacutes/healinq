import { redirect } from "next/navigation";

export default function CounselorsIndexPage() {
  // Redirect root /counselors to the profile page so both
  // /counselors and /counselors/profile show the same view.
  redirect("/counselors/profile");
}
