"use client";

import { createTeam } from "@/lib/server";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import Loading from "./loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const NewTeamForm = ({ userId, admin }: { userId: string; admin: boolean }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("userId", userId);

    try {
      await createTeam(formData);
      // Optionally handle successful team creation
      setIsDialogOpen(false); // Close the dialog after successful creation
    } catch (err) {
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {admin ? (
        <DialogTrigger asChild>
          <Button variant={"secondary"} onClick={() => setIsDialogOpen(true)}>
            Create Team
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Team name..."
            minLength={3}
            className="w-full"
            name="name"
            required
          />
          <div className="flex justify-end gap-2">
            {/* <Button variant={"secondary"} type="button">
          Cancel
        </Button> */}
            <Button variant={"default"} type="submit">
              {loading ? <Loading /> : "Submit"}
            </Button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
        </form>
        {/* <DialogDescription></DialogDescription> */}
      </DialogContent>
    </Dialog>
  );
};

export default NewTeamForm;
