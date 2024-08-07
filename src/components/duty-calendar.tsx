"use client";

import { formatDate } from "@/lib/utils";
import { Duty, User } from "@prisma/client";
import { useState } from "react";
import { Calendar } from "./ui/calendar";
import Legend from "./calender-legend";
import { format, parse } from "date-fns";
import { makeNotAvailable, makeAvailable } from "@/lib/server"; // Assuming you have a makeAvailable function
import NotAvailableButton from "./not-available-btn";
import SwitchDuty from "./switch-duty";

const DutyCalendar = ({
  duties,
  userId,
  users,
  allDuties,
}: {
  duties: Duty[];
  userId: string;
  users: User[];
  allDuties: Duty[];
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

  const handleAvailabilityToggle = async (data: FormData) => {
    // event.preventDefault();
    setNotAvailableLoading(true);
    // const formData = new FormData();
    // formData.append("date", date || "");
    // formData.append("userId", userId);
    try {
      if (selectedDuty && selectedDuty.name === "NOT_AVAILABLE") {
        await makeAvailable(data); // Assuming you have a makeAvailable function
      } else {
        await makeNotAvailable(data);
      }
    } catch (error) {
      console.error("Failed to toggle availability", error);
    } finally {
      setNotAvailableLoading(false);
    }
  };

  return (
    <div className="flex lg:flex-row flex-col justify-between items-center gap-4 lg:pt-10">
      <div className="flex flex-col lg:w-2/3 w-full mx-auto lg:px-16">
        {date ? (
          <>
            <h2 className="font-semibold text-2xl break-words overflow-hidden">
              {`${format(
                parse(date, "yyyy-MM-dd", new Date()),
                "EEEE, d MMMM"
              )}`}
            </h2>
            <div className="py-4 text-zinc-400">
              <div className="mb-1">You have:</div>
              {selectedDuty ? (
                <div
                  className={`p-1 rounded-md border-2 text-center ${
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
            <div className="flex gap-2">
              <NotAvailableButton
                date={date}
                userId={userId}
                selectedDuty={selectedDuty}
                handleAvailabilityToggle={handleAvailabilityToggle}
              />
              <SwitchDuty
                selectedDuty={selectedDuty}
                duties={allDuties}
                users={users}
                userId={userId}
              />
            </div>
          </>
        ) : (
          <div className="text-zinc-400">No date selected</div>
        )}
      </div>
      <div className="flex flex-col justify-center items-start mt-8 lg:mt-0">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : new Date()}
          onSelect={selectDate}
          className="rounded-md overflow-hidden"
          activeDuties={duties}
        />
        <Legend text="Active duties" color="red" />
        <Legend text="Not available" color="yellow" />
        <Legend text="Secondary duties" color="blue" />
      </div>
    </div>
  );
};

export default DutyCalendar;
