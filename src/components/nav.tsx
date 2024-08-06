import { getUser } from "@/lib/server";
import Link from "next/link";
import { cookies } from "next/headers";
import ProfileCard from "./profile-card";

const NavLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link className="hover:text-white text-zinc-400" href={href}>
      {text}
    </Link>
  );
};

const Nav = async () => {
  // const userId = cookies().get("userId");
  // if (!userId) {
  //   return <></>;
  // }
  const user = await getUser().catch((err) => {
    console.error(err);
  });

  if (!user) {
    return <></>;
  }

  return (
    <div className="w-full flex items-center gap-6 px-10 py-4 overflow-y-hidden">
      <div className="font-semibold text-lg mr-6 lg:block hidden">
        Duty Tracker
      </div>
      <NavLink text="My duties" href="/" />
      <NavLink text="Teams" href="/teams" />
      <ProfileCard user={user} />
    </div>
  );
};

export default Nav;
