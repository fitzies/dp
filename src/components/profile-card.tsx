"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { User } from "@prisma/client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { logout } from "@/lib/server";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProfileCard = ({ user }: { user: User }) => {
  const router = useRouter();

  return (
    <div className="ml-auto cursor-pointer flex items-center gap-4">
      <Popover>
        <PopoverTrigger>
          <Avatar>
            <AvatarFallback>
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 items-start justify-center">
          {/* <h3 className="text-lg font-semibold">{user.username}</h3> */}
          <p className="text-zinc-40">You have {user.points} points</p>
          <div className="flex w-full gap-2">
            <form
              action={async (data) => {
                await logout(data);
                router.refresh();
              }}
            >
              <Button variant={"secondary"} className="ml-auto">
                Logout
              </Button>
            </form>
            <Link href={"/credentials"}>
              <Button variant={"secondary"}>Credentials</Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProfileCard;
