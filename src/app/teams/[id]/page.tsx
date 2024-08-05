import DutyTable from "@/components/duty-table";
import PageWrapper from "@/components/page-wrapper";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Page = async ({ params }: { params: { id: string } }) => {
  const team = await prisma.team.findFirst({
    where: { id: parseInt(params.id) },
  });

  if (!team) {
    return <></>;
  }

  const duties = await prisma.duty.findMany({
    where: { teamId: team?.id },
  });

  if (!duties) {
    return <></>;
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl font-semibold mb-4 overflow-hidden">
        Assigned duties
      </h1>
      <DutyTable team={team} duties={duties} />
    </PageWrapper>
  );
};

export default Page;
