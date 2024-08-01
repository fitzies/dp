"use client";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar } from "./calendar";

const DateRangePicker = ({
  className,
  date = {
    from: new Date(2024, 7, 20),
    to: addDays(new Date(2024, 8, 20), 20),
  },
  setDate,
  startDateName = "startDate",
  endDateName = "endDate",
}: {
  className?: string;
  date: DateRange | undefined;
  setDate: Dispatch<SetStateAction<DateRange | undefined>>;
  startDateName?: string; // Optional prop to set the name of the start date input field
  endDateName?: string; // Optional prop to set the name of the end date input field
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (date?.from && date?.to) {
      setStartDate(format(date.from, "yyyy-MM-dd"));
      setEndDate(format(date.to, "yyyy-MM-dd"));
    } else {
      setStartDate("");
      setEndDate("");
    }
  }, [date]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name={startDateName} value={startDate} />
      <input type="hidden" name={endDateName} value={endDate} />
    </div>
  );
};

export default DateRangePicker;
