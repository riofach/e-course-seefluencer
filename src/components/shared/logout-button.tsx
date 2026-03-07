"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "~/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showIcon?: boolean;
}

export function LogoutButton({
  className,
  variant = "outline",
  showIcon = true,
}: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsPending(true);
    await signOut({ redirect: false });
    toast.success("Signed out successfully.");
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant={variant}
      className={cn("min-h-[44px]", className)}
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Sign out"
    >
      {isPending ? (
        "Signing out..."
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          Sign Out
        </>
      )}
    </Button>
  );
}
