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
import { submitLogin } from "@/lib/server";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = ({ params }: { params: { slug: string } }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await submitLogin(formData);
      // Ensure loading state is set to false before redirect
      // setLoading(false);`
      router.push("/"); // Redirect to the home page
    } catch (error) {
      setError((error as Error).message || "An unknown error occurred");
      // Set loading state to false if there's an error
      setLoading(false);
    }
  };

  return (
    <form
      className="w-screen h-[100vh] flex items-center justify-center"
      onSubmit={handleSubmit}
    >
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your username and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="oliver_sp"
                required
                name="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required name="password" />
            </div>
            <Button type="submit" className="w-full">
              {loading ? <Loading /> : "Login"}
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

export default Page;
