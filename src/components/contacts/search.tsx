// src/components/contacts/search.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debouncedValue = useDebounce(value, 500);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const queryString = createQueryString({
      search: debouncedValue || null,
    });

    router.push(`${pathname}?${queryString}`);
  }, [debouncedValue, router, pathname, createQueryString]);

  return (
    <div className="relative w-full md:w-[300px]">
      <SearchIcon
        className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
      />
      <Input
        placeholder="Search contacts..."
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="pl-8 pr-8"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 py-0"
          onClick={() => setValue("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}