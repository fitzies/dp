"use client";

import { Duty } from "@prisma/client";
import Loading from "./loading";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";

const NotAvailableButton = ({
  date,
  userId,
  selectedDuty,
  handleAvailabilityToggle,
}: {
  date: string | null;
  userId: string;
  selectedDuty: Duty | null | undefined;
  handleAvailabilityToggle: (data: FormData) => Promise<void>;
}) => {
  const [text, setText] = useState<string>("");

  if (selectedDuty && selectedDuty.name === "NOT_AVAILABLE") {
    return (
      <form action={handleAvailabilityToggle}>
        <input type="hidden" name="date" value={date || ""} />
        <input type="hidden" name="userId" value={userId} />
        <Button
          type="submit"
          variant="secondary"
          disabled={!!selectedDuty && selectedDuty.name !== "NOT_AVAILABLE"}
        >
          {selectedDuty && selectedDuty.name === "NOT_AVAILABLE"
            ? "Make available"
            : "Not available"}
        </Button>
      </form>
    );
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          type="submit"
          variant="secondary"
          disabled={!!selectedDuty && selectedDuty.name !== "NOT_AVAILABLE"}
        >
          {selectedDuty && selectedDuty.name === "NOT_AVAILABLE"
            ? "Make available"
            : "Not available"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="overflow-hidden">
            Why are you unavailable?
          </DialogTitle>
          <DialogDescription>
            If your reason is deemed not proper, it can be revoked by the Duty
            planner.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" action={handleAvailabilityToggle}>
          <input type="hidden" name="date" value={date || ""} />
          <input type="hidden" name="userId" value={userId} />
          <Input
            placeholder="Hackathon event..."
            value={text}
            onChange={(e) => setText(() => e.target.value)}
            name="reason"
          />
          <Button disabled={text.length < 6}>Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotAvailableButton;
