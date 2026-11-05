import {
  useCountriesQuery,
  useLanguagesQuery,
} from "@/services/internalization";
import { useSessionStore, useUpdateProfile } from "@/services/auth";
import GithubIcon from "@/shared/assets/images/github.svg";
import LinkedinIcon from "@/shared/assets/images/linkedin.svg";
import TwitterXIcon from "@/shared/assets/images/twitter-x.svg";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { Textarea } from "@/shared/ui/kit/textarea";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/shared/ui/kit/multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { CountryFlag } from "@/services/internalization";
import { toast } from "@/shared/ui/kit/sonner-toast";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  homepage: z.string().optional(),
  bio: z.string().optional(),
  countries: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  github_username: z.string().optional(),
  linkedin_username: z.string().optional(),
  x_username: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileForm = () => {
  const user = useSessionStore((state) => state.user);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.profile?.name || "",
      homepage: user?.profile?.homepage || "",
      bio: user?.profile?.bio || "",
      countries:
        user?.profile?.countries?.map((country) => country.id.toString()) || [],
      languages:
        user?.profile?.languages?.map((language) => language.id.toString()) ||
        [],
      github_username: user?.profile?.github_username || "",
      linkedin_username: user?.profile?.linkedin_username || "",
      x_username: user?.profile?.x_username || "",
    },
  });
  const { updateProfile, isPending, errorMessage } = useUpdateProfile();

  const { data: languagesData, isLoading: isLoadingLanguages } =
    useLanguagesQuery();
  const { data: countriesData, isLoading: isLoadingCountries } =
    useCountriesQuery();

  const handleFormSubmit = (values: ProfileFormValues) => {
    updateProfile(
      {
        name: values.name || null,
        homepage: values.homepage || null,
        bio: values.bio || null,
        github_username: values.github_username || null,
        linkedin_username: values.linkedin_username || null,
        x_username: values.x_username || null,
        languages: !values.languages?.length
          ? []
          : values.languages.map(Number),
        countries: !values.countries?.length
          ? []
          : values.countries.map(Number),
      },
      () => toast.success("Profile updated successfully."),
      (error) => toast.error(error),
    );
  };

  return (
    <form
      className="grid grid-cols-2 gap-6 w-full"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <Input label="Name" error={errors.name?.message} {...register("name")} />

      <Input
        label="Personal website"
        error={errors.homepage?.message}
        {...register("homepage")}
      />

      <Controller
        name="countries"
        control={control}
        render={({ field }) => (
          <MultiSelect
            values={field.value}
            onValuesChange={field.onChange}
          >
            <MultiSelectTrigger className="h-16">
              <MultiSelectValue
                placeholder="Countries"
                isLoading={isLoadingCountries}
              />
            </MultiSelectTrigger>
            <MultiSelectContent search={{ placeholder: "Search countries..." }}>
              <MultiSelectGroup isLoading={isLoadingCountries}>
                {countriesData?.countries?.map((country) => (
                  <MultiSelectItem
                    key={country.id}
                    value={country.id.toString()}
                  >
                    <CountryFlag countryCode={country.code} />
                    <span>{country.name}</span>
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        )}
      />

      <Controller
        name="languages"
        control={control}
        render={({ field }) => (
          <MultiSelect
            values={field.value}
            onValuesChange={field.onChange}
          >
            <MultiSelectTrigger className="h-16">
              <MultiSelectValue
                placeholder="Languages"
                isLoading={isLoadingLanguages}
              />
            </MultiSelectTrigger>
            <MultiSelectContent search={{ placeholder: "Search languages..." }}>
              <MultiSelectGroup isLoading={isLoadingLanguages}>
                {languagesData?.languages?.map((language) => (
                  <MultiSelectItem
                    key={language.id}
                    value={language.id.toString()}
                  >
                    {language.name}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        )}
      />

      <Input
        label="Linkedin username"
        labelClassName="left-12"
        error={errors.linkedin_username?.message}
        leftElement={
          <img src={LinkedinIcon} alt="LinkedIn" className="size-6 shrink-0" />
        }
        {...register("linkedin_username")}
      />

      <Input
        label="X username"
        labelClassName="left-12"
        error={errors.x_username?.message}
        leftElement={
          <img
            src={TwitterXIcon}
            alt="X (Twitter)"
            className="size-6 shrink-0"
          />
        }
        {...register("x_username")}
      />

      <Input
        label="GitHub username"
        labelClassName="left-12"
        error={errors.github_username?.message}
        leftElement={
          <img src={GithubIcon} alt="GitHub" className="size-6 shrink-0" />
        }
        {...register("github_username")}
      />

      <br />

      <Textarea
        inputClassName="min-h-24"
        label="Bio"
        error={errors.bio?.message}
        {...register("bio")}
      />

      {errorMessage && (
        <Text className="col-span-2" color="error">
          {errorMessage}
        </Text>
      )}

      <Button
        className="col-span-2 justify-self-center px-10"
        type="submit"
        isLoading={isPending}
      >
        Save
      </Button>
    </form>
  );
};
