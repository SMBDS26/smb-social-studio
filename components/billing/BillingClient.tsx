"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Users, Building2, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AccountData {
  id: string;
  name: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  stripeSubscriptionId: string | null;
  _count: { users: number; brands: number };
  billingEvents: { id: string; type: string; amountGbp: number | null; status: string; occurredAt: Date }[];
}

interface Props { account: AccountData }

const STATUS_CONFIG = {
  TRIALING: { label: "Free trial", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
  PAST_DUE: { label: "Payment failed", color: "bg-red-100 text-red-700 border-red-200" },
  CANCELED: { label: "Cancelled", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const FEATURES = [
  "Unlimited brands",
  "Unlimited users",
  "Unlimited posts",
  "AI-powered content generation",
  "5 social platforms",
  "Content calendar",
  "Post scheduling & publishing",
  "Platform preview mockups",
];

export function BillingClient({ account }: Props) {
  const [loading, setLoading] = useState<"portal" | "checkout" | null>(null);

  const statusConfig = STATUS_CONFIG[account.subscriptionStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.TRIALING;

  const handleAction = async (action: "portal" | "checkout") => {
    setLoading(action);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">£99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <Badge variant="outline" className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
            <div className="text-right text-sm text-gray-500">
              {account.subscriptionStatus === "TRIALING" && account.trialEndsAt && (
                <p>Trial ends {format(new Date(account.trialEndsAt), "d MMM yyyy")}</p>
              )}
              {account.subscriptionStatus === "ACTIVE" && account.currentPeriodEnd && (
                <p>Next charge {format(new Date(account.currentPeriodEnd), "d MMM yyyy")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <Separator />

          {account.subscriptionStatus === "TRIALING" || !account.stripeSubscriptionId ? (
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={() => handleAction("checkout")}
              disabled={loading === "checkout"}
            >
              {loading === "checkout" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Subscribe for £99/month
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleAction("portal")}
              disabled={loading === "portal"}
            >
              {loading === "portal" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage billing
            </Button>
          )}

          <p className="text-xs text-center text-gray-400">
            Charged on the last day of each month · Cancel any time
          </p>
        </CardContent>
      </Card>

      {/* Account usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Brands</span>
            <span className="ml-auto font-medium">{account._count.brands}</span>
            <Badge variant="secondary" className="text-xs">Unlimited</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Team members</span>
            <span className="ml-auto font-medium">{account._count.users}</span>
            <Badge variant="secondary" className="text-xs">Unlimited</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      {account.billingEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Billing history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {account.billingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-700 capitalize">{event.type.replace("invoice.", "")}</p>
                    <p className="text-xs text-gray-400">{format(new Date(event.occurredAt), "d MMM yyyy")}</p>
                  </div>
                  <div className="text-right">
                    {event.amountGbp != null && (
                      <p className="font-medium">£{event.amountGbp.toFixed(2)}</p>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${event.status === "paid" ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
