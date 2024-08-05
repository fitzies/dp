"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Duty, DutyName } from "@prisma/client";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  activeDuties?: Duty[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  activeDuties = [],
  ...props
}: CalendarProps) {
  // Convert activeDuties to Date objects and classify by name
  const activeDutyDates = activeDuties.map((duty) => {
    const [year, month, day] = duty.date.split("-").map(Number);
    return { date: new Date(year, month - 1, day), name: duty.name };
  });

  // Create a modifiers object
  const modifiers = {
    notAvailable: activeDutyDates
      .filter((duty) => duty.name === DutyName.NOT_AVAILABLE)
      .map((duty) => duty.date),
    otherDuty: activeDutyDates
      .filter((duty) => duty.name !== DutyName.NOT_AVAILABLE)
      .map((duty) => duty.date),
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 overflow-hidden ", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 overflow-hidden",
        month: "space-y-4 overflow-hidden",
        caption:
          "flex justify-center pt-1 relative items-center overflow-hidden",
        caption_label: "text-sm font-medium overflow-hidden",
        nav: "space-x-1 flex items-center overflow-hidden",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1 overflow-hidden",
        nav_button_next: "absolute right-1 overflow-hidden",
        table: "w-full border-collapse space-y-1 overflow-hidden",
        head_row: "flex overflow-hidden",
        head_cell:
          "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-zinc-400 overflow-hidden",
        row: "flex w-full mt-2 overflow-hidden",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative overflow-hidden",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md overflow-hidden",
          "[&:has([aria-selected].day-outside)]:bg-zinc-100/50 overflow-hidden",
          "[&:has([aria-selected])]:bg-zinc-100 overflow-hidden",
          "first:[&:has([aria-selected])]:rounded-l-md overflow-hidden",
          "last:[&:has([aria-selected])]:rounded-r-md overflow-hidden",
          "focus-within:relative focus-within:z-20 overflow-hidden",
          "dark:[&:has([aria-selected].day-outside)]:bg-zinc-800/50 overflow-hidden",
          "dark:[&:has([aria-selected])]:bg-zinc-800 overflow-hidden",
          "!rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50 focus:bg-zinc-900 focus:text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900 dark:focus:bg-zinc-50 dark:focus:text-zinc-900 rounded-md",
        day_today:
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        day_outside:
          "day-outside text-zinc-500 opacity-50 aria-selected:bg-zinc-100/50 aria-selected:text-zinc-500 aria-selected:opacity-30 dark:text-zinc-400 dark:aria-selected:bg-zinc-800/50 dark:aria-selected:text-zinc-400 rounded-md",
        day_disabled: "text-zinc-500 opacity-50 dark:text-zinc-400",
        day_range_middle:
          "aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 rounded-md",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiers={modifiers}
      modifiersClassNames={{
        notAvailable: "bg-yellow-400",
        otherDuty: "bg-red-400",
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
