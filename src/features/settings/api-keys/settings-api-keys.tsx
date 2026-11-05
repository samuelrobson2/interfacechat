import huggingfaceImage from "@/shared/assets/images/huggingface.svg";
import kaggleImage from "@/shared/assets/images/kaggle.svg";
import { LogoIcon } from "@/shared/assets/icons/Logo";
//import googleSheetsImage from "@/shared/assets/images/google-sheets.svg";
import { SettingsApiKey } from "./settings-api-key";
import { SettingsTogetherProviderKey } from "./settings-together-provider-key";
import {
  API_KEY_PROVIDER,
  HUGGINGFACE_PROVIDER,
  KAGGLE_OAUTH_PROVIDER,
  useApiKeysSuspense,
} from "@/services/settings";
import { Separator } from "@/shared/ui/kit/separator";

export function SettingsApiKeys() {
  const { isApiKeyExists, apiKeys } = useApiKeysSuspense();

  const huggingfaceKeyExists = isApiKeyExists("huggingface");
  const kaggleConnected = isApiKeyExists(KAGGLE_OAUTH_PROVIDER);
  //const googleSheetsKeyExists = isApiKeyExists("google_sheets");

  return (
    <div className="flex h-full flex-col gap-[80px]">
      <div className="flex h-fit items-start gap-8">
        <SettingsApiKey
          className="flex-1"
          provider={API_KEY_PROVIDER}
          apiKeyExists={apiKeys?.length > 0}
          apiKeys={apiKeys}
          icon={<LogoIcon svgClasses="size-9" />}
          headerTitle="Adaption Key"
          action="Create"
        />
      </div>
      <div className="flex w-full min-h-0 flex-nowrap items-stretch gap-8">
        <SettingsTogetherProviderKey className="h-full min-h-0 min-w-0 flex-1" />
        <Separator
          orientation="vertical"
          color="secondary"
          className="self-stretch"
        />
        <SettingsApiKey
          className="h-full min-h-0 min-w-0 flex-1"
          provider={HUGGINGFACE_PROVIDER}
          apiKeyExists={huggingfaceKeyExists}
          icon={<img src={huggingfaceImage} alt="Hugging Face" />}
          headerTitle="Hugging Face Key"
        />
        <Separator
          orientation="vertical"
          color="secondary"
          className="self-stretch"
        />
        <SettingsApiKey
          className="h-full min-h-0 min-w-0 flex-1"
          provider={KAGGLE_OAUTH_PROVIDER}
          apiKeyExists={kaggleConnected}
          icon={<img src={kaggleImage} alt="Kaggle" />}
          headerTitle="Kaggle"
          description={
            kaggleConnected
              ? "The connection to your Kaggle account is active"
              : "You don't have a connected Kaggle account yet"
          }
        />
      </div>
      {/* <div className="flex gap-8 h-fit items-start">
        <SettingsApiKey
          className="flex-1"
          provider="google_sheets"
          apiKeyExists={googleSheetsKeyExists}
          icon={<img src={googleSheetsImage} alt="Google Sheets" />}
          headerTitle="Google Sheets"
          description={
            googleSheetsKeyExists
              ? "The connection to your Google Sheets account is active"
              : "You don’t have a connected Google Sheets account yet"
          }
        />
      </div> */}
    </div>
  );
}
