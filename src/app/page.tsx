import { fetchAllDuties, fetchDuties } from "@/lib/server";
import PageWrapper from "@/components/page-wrapper";
import { cookies } from "next/headers";
import DutyCalendar from "@/components/duty-calendar";
import { fetchUsers } from "@/lib/utils";

const Page = async ({ params }: { params: { slug: string } }) => {
  const userId = cookies().get("userId");

  const duties = await fetchDuties();
  const allDuties = await fetchAllDuties();
  const users = await fetchUsers();

  return (
    <PageWrapper>
      <DutyCalendar
        duties={duties}
        userId={userId!.value}
        users={users}
        allDuties={allDuties}
      />
    </PageWrapper>
  );
};

export default Page;
