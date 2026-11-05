import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function Panel() {
  const { profile } = await requireUser();
  redirect(profile.role === "trainer" ? "/trainer" : "/student");
}
