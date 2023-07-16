-- CreateEnum
CREATE TYPE "MembershipIntervalType" AS ENUM ('month', 'year', 'week', 'day');

-- CreateEnum
CREATE TYPE "SubscriptionPauseCollectionBehaviorType" AS ENUM ('keep_as_draft', 'mark_uncollectible', 'void');

-- CreateEnum
CREATE TYPE "SubscriptionStatusType" AS ENUM ('active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused');

-- CreateEnum
CREATE TYPE "SubscriptionCancellationFeedbackType" AS ENUM ('too_expensive', 'missing_features', 'switched_service', 'unused', 'customer_service', 'too_complex', 'low_quality', 'other');

-- CreateEnum
CREATE TYPE "SubscriptionCancellationReasonType" AS ENUM ('cancellation_requested', 'payment_disputed', 'payment_failed');

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "unitAmount" INTEGER NOT NULL,
    "interval" "MembershipIntervalType" NOT NULL,
    "intervalCount" INTEGER NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "defaultPaymentMethod" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "billingCycleAnchor" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatusType" NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "pauseCollectionBehavior" "SubscriptionPauseCollectionBehaviorType",
    "latestInvoice" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionCancellation" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "feedback" "SubscriptionCancellationFeedbackType" NOT NULL,
    "reason" "SubscriptionCancellationReasonType" NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCancellation_subscriptionId_key" ON "SubscriptionCancellation"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCancellation" ADD CONSTRAINT "SubscriptionCancellation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
