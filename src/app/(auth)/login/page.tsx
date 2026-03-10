import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "~/components/shared/login-form";

export const metadata = { title: "Sign In | Learning Platform" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerAuthSession();

  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl = Array.isArray(resolvedSearchParams.callbackUrl)
    ? resolvedSearchParams.callbackUrl[0]
    : resolvedSearchParams.callbackUrl;

  if (session) redirect(callbackUrl ?? "/courses");

  return <LoginForm />;
}
