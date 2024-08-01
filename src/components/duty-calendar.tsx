"use client";

import { formatDate } from "@/lib/utils";
import { Duty } from "@prisma/client";
import { useState } from "react";
import { Calendar } from "./ui/calendar";
import Legend from "./calender-legend";
import { Button } from "./ui/button";
import { format, parse } from "date-fns";
import { makeNotAvailable, makeAvailable } from "@/lib/server"; // Assuming you have a makeAvailable function
import Loading from "./loading";

const DutyCalendar = ({
  duties,
  userId,
}: {
  duties: Duty[];
  userId: string;
}) => {
  const [date, setDate] = useState<string | null>(formatDate(new Date()));
  const [notAvailableLoading, setNotAvailableLoading] =
    useState<boolean>(false);

  const selectDate = (date: Date | null | undefined) => {
    if (date) {
      setDate(formatDate(date));
    }
  };

  const selectedDuty = date ? duties.find((duty) => date === duty.date) : null;

  const handleAvailabilityToggle = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotAvailableLoading(true);
    const formData = new FormData();
    formData.append("date", date || "");
    formData.append("userId", userId);
    try {
      if (selectedDuty && selectedDuty.name === "NOT_AVAILABLE") {
        await makeAvailable(formData); // Assuming you have a makeAvailable function
      } else {
        await makeNotAvailable(formData);
      }
    } catch (error) {
      console.error("Failed to toggle availability", error);
    } finally {
      setNotAvailableLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-start">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : new Date()}
          onSelect={selectDate}
          className="rounded-md"
          activeDuties={duties}
        />
        <Legend text="Active duties" color="red" />
        <Legend text="Not available" color="yellow" />
        <Legend text="Secondary duties" color="blue" />
      </div>
      <div className="flex flex-col lg:w-2/3 w-full mx-auto lg:px-16">
        {date ? (
          <>
            <h2 className="font-semibold text-3xl">
              {`${format(
                parse(date, "yyyy-MM-dd", new Date()),
                "EEEE, d MMMM"
              )}`}
            </h2>
            <p className="text-zinc-400 lg:text-md text-sm">
              Please note that even if you schedule plans for a specific date,
              it does not guarantee that you will be excused.
            </p>
            <div className="py-4 text-zinc-400">
              <div className="mb-1">You have:</div>
              {selectedDuty ? (
                <div
                  className={`p-1 rounded-md border-2 ${
                    selectedDuty.name === "NOT_AVAILABLE"
                      ? "bg-yellow-400 bg-opacity-75 border-yellow-400"
                      : "bg-red-400 bg-opacity-75 border-red-400"
                  }`}
                >
                  <p className="font-bold text-white">
                    {selectedDuty.name.replace("_", " ")}
                  </p>
                </div>
              ) : (
                <div className="p-1 rounded-md">
                  <p className="font-bold text-white">No duties...</p>
                </div>
              )}
            </div>
            <form className="flex mt-auto" onSubmit={handleAvailabilityToggle}>
              <input type="hidden" name="date" value={date || ""} />
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="secondary">
                {notAvailableLoading ? (
                  <Loading />
                ) : selectedDuty && selectedDuty.name === "NOT_AVAILABLE" ? (
                  "Make available"
                ) : (
                  "Not available"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-zinc-400">No date selected</div>
        )}
      </div>
    </>
  );
};

export default DutyCalendar;
