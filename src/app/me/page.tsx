import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Smart redirect after login based on role
export default async function MePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role === "PROVIDER" || role === "ADMIN") redirect("/dashboard");
  redirect("/klient/bookings");
}
