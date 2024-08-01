import { getUser } from "@/lib/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback } from "./ui/avatar";

const NavLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link className="hover:text-white text-zinc-400" href={href}>
      {text}
    </Link>
  );
};

const Nav = async () => {
  const userId = cookies().get("userId");
  if (!userId) {
    return <></>;
  }
  const user = await getUser(userId.value).catch((err) => {
    console.error(err);
  });

  if (!user) {
    return <></>;
  }

  return (
    <div className="w-full flex items-center gap-6 px-10 py-4">
      <div className="font-semibold text-lg mr-6 lg:block hidden">
        Duty Tracker
      </div>
      <NavLink text="My duties" href="/" />
      <NavLink text="Teams" href="/teams" />
      <div className="ml-auto cursor-pointer flex items-center gap-4">
        <p className="text-zinc-400 font-extralight">{user.points} points</p>
        <Avatar>
          <AvatarFallback>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Nav;
