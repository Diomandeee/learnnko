"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <PopoverPrimitive.Content
      ref={ref}
      className={cn("z-10 p-4 bg-white border rounded shadow-sm", className)}
      {...rest}
    />
  );
});

// Add displayName for debugging purposes
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent }
