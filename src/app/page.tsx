import { fetchDuties } from "@/lib/utils";
import { redirect } from "next/navigation";
import PageWrapper from "@/components/page-wrapper";
import { cookies } from "next/headers";
import DutyCalendar from "@/components/duty-calendar";

const Page = async ({ params }: { params: { slug: string } }) => {
  const userId = cookies().get("userId");

  if (!userId) {
    redirect("/login");
  }

  const duties = await fetchDuties(userId.value);

  return (
    <PageWrapper className="gap-8 flex flex-col-reverse lg:flex-row items-center lg:justify-between justify-end !px-24">
      <DutyCalendar duties={duties} userId={userId.value} />
      <div className="hidden"></div>
    </PageWrapper>
  );
};

export default Page;
