// Payment page disabled - SpotMap is free
/*
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function PaymentPage() {

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>
            SpotMap is currently free for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            SpotMap is a free community platform for sharing longboarding spots. 
            No payment or subscription required!
          </p>
          <div className="mt-4">
            <Link href="/map">
              <Button>Explore Spots</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
              <div className="blur-sm pointer-events-none">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>
                      Manage your billing and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Current Plan
                        </p>
                        <p className="text-md">Pro Plan</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Billing Status
                        </p>
                        <p className="text-md">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  Your current subscription information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Status
                    </p>
                    <p className="text-md capitalize">
                      {subscriptionDetails.subscription.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Amount
                    </p>
                    <p className="text-md">
                      {subscriptionDetails.subscription.amount / 100}{" "}
                      {subscriptionDetails.subscription.currency.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Billing Interval
                    </p>
                    <p className="text-md capitalize">
                      {subscriptionDetails.subscription.recurringInterval}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Current Period End
                    </p>
                    <p className="text-md">
                      {new Date(
                        subscriptionDetails.subscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {subscriptionDetails.subscription.cancelAtPeriodEnd && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will cancel at the end of the current
                      billing period.
                    </p>
                  </div>
                )}
                <ManageSubscription />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
*/

// Temporary simple page while payment features are disabled
export default function PaymentPage() {
  return <div>Payment features coming soon</div>;
}
