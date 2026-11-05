import { useKaggleOAuthCallback } from "@/services/auth";
import { useSearchParamsTabs } from "@/shared/lib/react/use-search-params-tabs";
import {
  ChildPageBackLink,
  ChildPageHeader,
  ChildPageLayout,
  ChildPageTitle,
} from "@/shared/ui/child-page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Suspense } from "react";
import { SettingsAccount } from "./account/compose/settings-account";
import { SettingsAccountSkeleton } from "./account/ui/settings-account-skeleton";
import { SettingsApiKeys } from "./api-keys/settings-api-keys";
import { SettingsApiKeysSkeleton } from "./api-keys/settings-api-keys-skeleton";
import { PaymentDetails } from "./payments/compose/payment-details";
import { SettingsPaymentsSkeleton } from "./payments/ui/settings-payments-skeleton";

export type SettingsTabs = "account" | "api_keys" | "payment_details";
const SETTINGS_TABS = ["account", "api_keys", "payment_details"] as const;

function SettingsPage() {
  useKaggleOAuthCallback();
  const { tab, handleTabChange } = useSearchParamsTabs<SettingsTabs>(
    SETTINGS_TABS,
    "account",
  );

  return (
    <ChildPageLayout className="pb-12.5 gap-8">
      <ChildPageHeader>
        <ChildPageBackLink />
        <ChildPageTitle>Settings</ChildPageTitle>
      </ChildPageHeader>

      <Tabs
        className="w-full overflow-hidden gap-15"
        value={tab}
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="api_keys">API keys</TabsTrigger>
          <TabsTrigger value="payment_details">Payment details</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Suspense fallback={<SettingsAccountSkeleton />}>
            <SettingsAccount />
          </Suspense>
        </TabsContent>
        <TabsContent value="api_keys">
          <Suspense fallback={<SettingsApiKeysSkeleton />}>
            <SettingsApiKeys />
          </Suspense>
        </TabsContent>
        <TabsContent value="payment_details">
          <Suspense fallback={<SettingsPaymentsSkeleton />}>
            <PaymentDetails />
          </Suspense>
        </TabsContent>
      </Tabs>
    </ChildPageLayout>
  );
}

export const Component = SettingsPage;
