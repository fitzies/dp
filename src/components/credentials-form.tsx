"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCredentials } from "@/lib/server";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CredentialsForm = ({ user }: { user: User }) => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmedNewPassword, setConfirmedNewPassword] = useState<string>("");

  return (
    <form
      className="w-screen h-[100vh] flex items-center justify-center"
      action={async (data) => {
        setLoading(() => true);
        try {
          await updateCredentials(data);
          // Make a toast saying it changed
          router.push("/");
        } catch (err) {
          console.error(err);
          setError((err as Error).message || "An unknown error occurred");
          setLoading(false);
        }
      }}
    >
      <input className="hidden" name="id" value={user.id} />
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Change your credentials
          </CardTitle>
          <CardDescription>
            Enter a new username and password to change your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={user.username}
                required
                name="username"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                type="password"
                required
                name="password"
                value={newPassword}
                onChange={(e) => setNewPassword(() => e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Confirm new password</Label>
              <Input
                type="password"
                required
                name="confirm-password"
                value={confirmedNewPassword}
                onChange={(e) => setConfirmedNewPassword(() => e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                newPassword !== confirmedNewPassword || newPassword.length < 4
              }
            >
              {loading ? <Loading /> : "Update Credentials"}
            </Button>
          </div>
          {error ? (
            <div className="w-full p-1 text-red-400 rounded-md mt-1">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
};

export default CredentialsForm;
