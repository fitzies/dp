// "use server";

import { getUser, logout } from "@/lib/server";
import Link from "next/link";
import ProfileCard from "./profile-card";
import { Bell } from "lucide-react";

const NavLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link className="hover:text-white text-zinc-400" href={href}>
      {text}
    </Link>
  );
};

const Nav = async () => {
  const user = await getUser().catch((err) => {
    console.error(err);
    // logout(new FormData());
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
      <div className="flex items-center ml-auto gap-4">
        <Link href={"/notifications"} className="text-zinc-400 scale-90">
          <Bell />
        </Link>
        <ProfileCard user={user} />
      </div>
    </div>
  );
};

export default Nav;
