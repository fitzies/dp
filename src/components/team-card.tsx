"use client";

import { Team, User } from "@prisma/client";
import { Card, CardDescription, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { useState } from "react";
import { Button } from "./ui/button";
import { updateTeamMembers } from "@/lib/server";
import Loading from "./loading";
import AssignDutyPopup from "./assign-duty-popup";
import { ArrowRight, Pencil } from "lucide-react";
import Link from "next/link";

const TeamCard = ({
  team,
  userId,
  existingUsers,
}: {
  team: Team;
  userId: string;
  existingUsers: User[];
}) => {
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await updateTeamMembers(formData);

    setLoading(false);
    setIsDialogOpen(false);
  };

  return (
    <Card className="py-4 px-4 flex items-center gap-4">
      <div className="flex flex-col">
        <CardTitle className="font-semibold text-2xl">{team.name}</CardTitle>
        <CardDescription>
          {team.admin === userId && (
            <div className="flex items-center gap-4">
              <AssignDutyPopup team={team} />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    className="hover:text-white duration-150 cursor-pointer"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Add members
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <input
                      className="hidden"
                      name="team-id"
                      value={team.id}
                      readOnly
                    />
                    <input
                      className="hidden"
                      name="members"
                      value={JSON.stringify(members)}
                      readOnly
                    />
                    <DialogHeader>
                      <DialogTitle>Add members to {team.name}</DialogTitle>
                      <DialogDescription>
                        <MultiSelector
                          values={members}
                          onValuesChange={setMembers}
                          loop
                          className="max-w-xs z-50"
                        >
                          <MultiSelectorTrigger>
                            <MultiSelectorInput placeholder="Add your members" />
                          </MultiSelectorTrigger>
                          <MultiSelectorContent>
                            <MultiSelectorList>
                              {existingUsers.map((user) => (
                                <MultiSelectorItem
                                  key={user.userId}
                                  value={user.username} // Ensure value is unique and consistent
                                >
                                  {user.username}
                                </MultiSelectorItem>
                              ))}
                            </MultiSelectorList>
                          </MultiSelectorContent>
                        </MultiSelector>
                      </DialogDescription>
                      <Button type="submit" disabled={loading}>
                        {loading ? <Loading /> : "Submit"}
                      </Button>
                    </DialogHeader>
                  </form>
                </DialogContent>
              </Dialog>
              {/* <span className="hover:text-white duration-150 cursor-pointer">
                Delete
              </span> */}
            </div>
          )}
        </CardDescription>
      </div>
      <Link className="ml-auto" href={"/teams/" + team.id.toString()}>
        <Button>
          <ArrowRight />
        </Button>
      </Link>
    </Card>
  );
};

export default TeamCard;
