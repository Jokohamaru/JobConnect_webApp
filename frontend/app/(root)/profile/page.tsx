import { redirect } from "next/navigation";

export default function ProfileDefaultPage() {
  redirect("/profile/dashboard");
}