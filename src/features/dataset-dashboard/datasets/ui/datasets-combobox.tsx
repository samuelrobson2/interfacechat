import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/kit/combobox";

export function DatasetsCombobox({
  label,
  ...props
}: React.ComponentProps<typeof Combobox> & { label: string }) {
  return (
    <Combobox {...props}>
      <ComboboxInput
        wrapperClassName="w-[250px]"
        label={label}
        readOnly
        inputClassName="cursor-pointer"
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: { label: string; value: string }) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
