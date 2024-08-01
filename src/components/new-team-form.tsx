"use client";

import { createTeam } from "@/lib/server";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import Loading from "./loading";

const NewTeamForm = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("userId", userId);

    try {
      await createTeam(formData);
      // Optionally handle successful team creation
    } catch (err) {
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Team name..."
        minLength={3}
        className="w-full"
        name="name"
        required
      />
      <div className="flex justify-end gap-2">
        {/* <Button variant={"secondary"} type="button">
          Cancel
        </Button> */}
        <Button variant={"default"} type="submit">
          {loading ? <Loading /> : "Submit"}
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
};

export default NewTeamForm;
