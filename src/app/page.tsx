import { fetchDuties } from "@/lib/utils";
import PageWrapper from "@/components/page-wrapper";
import { cookies } from "next/headers";
import DutyCalendar from "@/components/duty-calendar";
import { getUser } from "@/lib/server";

const Page = async ({ params }: { params: { slug: string } }) => {
  const duties = await fetchDuties();
  const user = await getUser();

  return (
    <PageWrapper>
      {user.username}
      <DutyCalendar duties={duties} userId={user.userId} />
    </PageWrapper>
  );
};

export default Page;
