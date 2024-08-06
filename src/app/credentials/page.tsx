import CredentialsForm from "@/components/credentials-form";
import { getUser } from "@/lib/server";

const Page = async ({ params }: { params: { slug: string } }) => {
  const user = await getUser();

  return (
    <>
      <CredentialsForm user={user} />
    </>
  );
};

export default Page;
