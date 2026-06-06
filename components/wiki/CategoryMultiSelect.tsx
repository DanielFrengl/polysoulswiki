"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CategoryWithCount } from "@/lib/types";

interface CategoryMultiSelectProps {
  categories: CategoryWithCount[];
  /** Selected category slugs. */
  value: string[];
  onChange: (slugs: string[]) => void;
}

export default function CategoryMultiSelect({
  categories,
  value,
  onChange,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (slug: string) => {
    onChange(
      value.includes(slug)
        ? value.filter((s) => s !== slug)
        : [...value, slug],
    );
  };

  const selected = categories.filter((c) => value.includes(c.slug));

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selected.length > 0
              ? `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected`
              : "Select categories"}
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories…" />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.slug}
                    value={category.name}
                    onSelect={() => toggle(category.slug)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value.includes(category.slug) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((category) => (
            <Badge key={category.slug} variant="secondary" className="gap-1">
              {category.name}
              <button
                type="button"
                aria-label={`Remove ${category.name}`}
                onClick={() => toggle(category.slug)}
                className="rounded-sm hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
