import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";
import { RegisterForm } from "~/components/shared/register-form";

export const metadata = {
  title: "Register | E-Course Platform",
  description: "Create a new account to access the learning platform.",
};

export default async function RegisterPage() {
  // AC #7: Redirect authenticated users away
  const session = await getServerAuthSession();
  if (session) {
    redirect("/courses");
  }

  return <RegisterForm />;
}
