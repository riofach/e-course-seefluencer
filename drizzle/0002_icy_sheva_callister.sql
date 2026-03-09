ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_midtrans_order_id_unique" UNIQUE("midtrans_order_id");