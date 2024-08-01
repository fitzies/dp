import { Duty, Team, User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers } from "@/lib/server";

const DutyTable = async ({
  team,
  duties = [],
}: {
  team: Team;
  duties?: Duty[];
}) => {
  const users: User[] = await getUsers(); // Ensure this returns User[] type

  return (
    <Table className="!w-full overflow-y-auto">
      <TableCaption>Duty assignments for {team.name}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Duty</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Assigned Personnel</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {duties.length > 0 ? (
          duties.map((duty) => {
            // Find the user with the matching userId
            const assignedUser = users.find(
              (user) => user.userId === duty.userId
            );

            return (
              <TableRow key={duty.id}>
                <TableCell>{duty.name}</TableCell>
                <TableCell>
                  {new Date(duty.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {assignedUser ? assignedUser.username : "Unknown User"}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No duties assigned
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DutyTable;
