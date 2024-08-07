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
  const strictDuties = duties
    .filter((duty) => duty.name !== "NOT_AVAILABLE")
    .filter((duty) => duty.userId !== userId);

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant={"secondary"}
          disabled={
            !selectedDuty || (selectedDuty && selectedDuty.name !== "COS")
          }
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

        <div className="w-full flex lg:flex-row flex-col gap-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Duties" />
            </SelectTrigger>
            <SelectContent>
              {strictDuties.map((duty) => {
                return (
                  <>
                    <SelectItem value={duty.id.toString()}>
                      {duty.name} on {duty.date}
                      {" - "}
                      {
                        users.find((user) => user.userId === duty.userId)
                          ?.username
                      }
                    </SelectItem>
                  </>
                );
              })}
            </SelectContent>
          </Select>
          <Button>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwitchDuty;
