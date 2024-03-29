'use client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shared/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { Button } from '@/shared/components/ui//button';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

type TSelectBox = {
  onSelect: (value: string, label: string) => void;
  searchLabel: string;
  noResultLabel: string;
  buttonText: string;
  options: {
    label: string;
    value: string;
  }[];
  preSelectedValue?: string;
  noSelect?: boolean;
  showCancel?: boolean;
};
const SelectBox = ({
  onSelect,
  options,
  searchLabel,
  noResultLabel,
  buttonText,
  preSelectedValue,
  noSelect,
  showCancel,
}: TSelectBox) => {
  const preSelectedData = preSelectedValue && options.find((entry) => entry.value === preSelectedValue);
  const generatePreSelectedValue = preSelectedData && `${preSelectedData.value}:${preSelectedData.label}`;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(generatePreSelectedValue ?? '');
  if (generatePreSelectedValue && value !== generatePreSelectedValue) {
    setValue(generatePreSelectedValue);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value
            ? options.find((option) => option.value === value.substring(0, value.indexOf(':')))?.label ?? buttonText
            : buttonText}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" side="bottom">
        <Command>
          <CommandInput placeholder={searchLabel} className="h-9" />
          <CommandEmpty>{noResultLabel}</CommandEmpty>
          <CommandGroup className="max-h-[350px] overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.value}:${option.label}`}
                onSelect={(currentValue) => {
                  const newValue = currentValue === value ? '' : currentValue;
                  if (!noSelect) setValue(newValue);
                  onSelect(
                    newValue.substring(0, currentValue.indexOf(':')),
                    newValue.substring(currentValue.indexOf(':') + 1),
                  );
                  setOpen(false);
                }}
              >
                {option.label}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value.substring(0, value.indexOf(':')) === option.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
            {showCancel && (
              <CommandItem
                value="cancel:Cancel"
                onSelect={(currentValue) => {
                  const newValue = currentValue === value ? '' : currentValue;
                  if (!noSelect) setValue(newValue);
                  onSelect(
                    newValue.substring(0, currentValue.indexOf(':')),
                    newValue.substring(currentValue.indexOf(':') + 1),
                  );
                  setOpen(false);
                }}
              >
                Cancel
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
  // https://ui.shadcn.com/docs/components/combobox
};

export default SelectBox;
