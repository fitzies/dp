import { fetchDuties } from "@/lib/utils";
import PageWrapper from "@/components/page-wrapper";
import { cookies } from "next/headers";
import DutyCalendar from "@/components/duty-calendar";

const Page = async ({ params }: { params: { slug: string } }) => {
  const userId = cookies().get("userId");

  const duties = await fetchDuties(userId!.value);

  return (
    <PageWrapper>
      <DutyCalendar duties={duties} userId={userId!.value} />
    </PageWrapper>
  );
};

export default Page;
