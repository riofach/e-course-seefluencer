"use client";

import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfile } from "~/server/actions/auth/update-profile";
import {
  ProfileSchema,
  type ProfileInput,
} from "~/server/actions/auth/schemas";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { ActionResponse } from "~/types";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<
    ActionResponse | null,
    FormData
  >(updateProfile, null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: initialName,
    },
  });

  useEffect(() => {
    if (state?.success === true) {
      toast.success("Profile updated successfully.");
      reset({ name: watch("name") });
    } else if (state?.success === false) {
      toast.error(state.error);
    }
  }, [reset, state, watch]);

  const currentName = watch("name");
  const hasNameChanged = currentName !== initialName;
  const isSubmitDisabled = isPending || !hasNameChanged;

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          {...register("name")}
          disabled={isPending}
          autoComplete="name"
          className={cn(
            errors.name && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.name && (
          <p className="text-destructive text-sm font-medium">
            {errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={email}
          disabled
          readOnly
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-muted-foreground text-sm">
          Email cannot be changed.
        </p>
      </div>
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="min-h-[44px] w-full"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
