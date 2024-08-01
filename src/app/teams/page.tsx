import PageWrapper from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { getTeams, getUser } from "@/lib/server";
import { cookies } from "next/headers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewTeamForm from "@/components/new-team-form";
import TeamCard from "@/components/team-card";
import { fetchUsers } from "@/lib/utils";

const Page = async ({ params }: { params: { slug: string } }) => {
  const userId = cookies().get("userId");
  if (!userId) {
    return <></>;
  }
  const user = await getUser(userId.value);
  const existingUsers = await fetchUsers();

  const teams = (await getTeams()).filter(
    (team) =>
      team.admin ||
      team.members.some((member) => member.userId === userId.value)
  );

  return (
    <>
      <PageWrapper>
        <div className="flex justify-between items-center w-full mb-4">
          <h1 className="text-2xl font-semibold">Your teams:</h1>
          <Dialog>
            {user?.admin ? (
              <DialogTrigger>
                <Button variant={"secondary"}>Create Team</Button>
              </DialogTrigger>
            ) : null}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new team</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <NewTeamForm userId={userId.value} />
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2">
          {teams.map((team) => (
            <TeamCard
              key={team.name + team.id}
              team={team}
              userId={userId.value}
              existingUsers={existingUsers}
            />
          ))}
        </div>
      </PageWrapper>
    </>
  );
};

export default Page;
