"use client";

import { useState, forwardRef } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "~/lib/utils";

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showIcon?: boolean;
}

export const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  (
    { className, variant = "outline", showIcon = true, onClick, ...props },
    ref,
  ) => {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPending(true);
      if (onClick) {
        onClick(e);
      }
      await signOut({ redirect: false });
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn("min-h-[44px]", className)}
        onClick={handleLogout}
        disabled={isPending}
        aria-label="Sign out"
        {...props}
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
  },
);
LogoutButton.displayName = "LogoutButton";
