import { Duty, User } from "@prisma/client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { requestDutySwitch } from "@/lib/server";
import { useRouter } from "next/navigation";

const SwitchDuty = ({
  selectedDuty,
  duties,
  users,
  userId,
}: {
  selectedDuty: Duty | null | undefined;
  duties: Duty[];
  users: User[];
  userId: string;
}) => {
  const [selectValue, setSelectValue] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  const strictDuties = duties
    .filter((duty) => duty.name !== "NOT_AVAILABLE")
    .filter((duty) => duty.userId !== userId);

  const alreadyRequested = selectedDuty
    ? strictDuties.find((duty) =>
        duty.requestSwitch.some((id) => id === selectedDuty.id)
      )
    : null;

  if (alreadyRequested) {
    return (
      <Button variant={"secondary"} disabled>
        Requested for {alreadyRequested.date}
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          disabled={
            !selectedDuty || (selectedDuty && selectedDuty.name !== "COS")
          }
          onClick={() => setIsDialogOpen(true)}
        >
          Switch duty
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="overflow-y-hidden">
            Request to switch a duty
          </DialogTitle>
          <DialogDescription>
            Your duty will only be switched when the other user accepts your
            request.
          </DialogDescription>
        </DialogHeader>

        <form
          className="w-full flex lg:flex-row flex-col gap-4"
          action={async (data) => {
            await requestDutySwitch(data);
            setIsDialogOpen(false); // Close the dialog on successful submission
            router.refresh(); // Optionally refresh the page
          }}
        >
          <input className="hidden" name="user" value={userId} />
          <input
            className="hidden"
            name="requesting-duty"
            value={selectValue}
          />
          <input
            className="hidden"
            name="duty-to-change"
            value={selectedDuty?.id}
          />
          <Select onValueChange={(e) => setSelectValue(() => e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Duties" />
            </SelectTrigger>
            <SelectContent>
              {strictDuties.map((duty) => (
                <SelectItem key={duty.id} value={duty.id.toString()}>
                  {duty.name} on {duty.date}
                  {" - "}
                  {users.find((user) => user.userId === duty.userId)?.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SwitchDuty;
