import PageWrapper from "@/components/page-wrapper";
import { createSwitchObjects, fetchDuties, getUser } from "../../lib/server";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Page = async ({ params }: { params: { slug: string } }) => {
  const user = await getUser().catch((err) => {
    console.error(err);
    // logout(new FormData());
  });
  const switches = await createSwitchObjects().then((result) => {
    console.log(result);
    return result;
  });

  return (
    <PageWrapper>
      <div className="flex flex-col gap-2">
        {switches.map((switchItem, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="overflow-hidden ">
                <span>{switchItem.userToSwitch?.username}</span> wants to switch
                his duty
              </CardTitle>
            </CardHeader>
            <CardContent>
              Switch your{" "}
              <span className="underline">{switchItem.duty.date}</span>{" "}
              {switchItem.duty.name} duty with his{" "}
              {switchItem.dutyToSwitch?.name} duty on the{" "}
              <span className="underline">{switchItem.dutyToSwitch?.date}</span>
            </CardContent>
            <CardFooter className="gap-4">
              <Button>Accept</Button>
              <Button variant={"secondary"}>Decline</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page;
