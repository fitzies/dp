"use client";

import { Team } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import DateRangePicker from "./ui/date-range-picker";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { assignDuty } from "@/lib/algo";
import Loading from "./loading"; // Ensure you have a loading component

const AssignDutyPopup = ({ team }: { team: Team }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 7, 20),
    to: addDays(new Date(2024, 8, 20), 20),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission

    setLoading(true); // Set loading state to true

    const formData = new FormData(event.currentTarget);

    try {
      await assignDuty(formData); // Call the function that handles the duty assignment
      setDialogOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error assigning duties:", error);
      // Optionally, you might want to show an error message
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <span
          className="hover:text-white duration-150 cursor-pointer"
          onClick={() => setDialogOpen(true)}
        >
          Assign duty
        </span>
      </DialogTrigger>
      <DialogContent className="">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="hidden" name="teamId" value={team.id} />
          <DialogTitle>Assign a new duty</DialogTitle>
          <DialogDescription>
            Choose your date and duty, and we will sort the rest based on
            availability and points. Note that the assignment algorithm will
            take a couple seconds.
          </DialogDescription>
          <div className="flex justify-between gap-4">
            <Select name="dutyName">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="What duty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COS">COS</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker date={date} setDate={setDate} />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loading /> : "Assign duties"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDutyPopup;
