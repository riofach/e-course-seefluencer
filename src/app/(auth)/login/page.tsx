import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "~/components/shared/login-form";

export const metadata = { title: "Sign In | Learning Platform" };

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session) redirect("/courses");

  return <LoginForm />;
}
