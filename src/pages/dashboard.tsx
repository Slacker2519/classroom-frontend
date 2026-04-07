import React, { useState, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BACKEND_BASE_URL } from "@/constants";
import { useNavigate } from "react-router";
import { RoleName } from "@/lib/permissions";
import { Loader2, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  image?: string | null;
  createdAt: string;
  classes: {
    id: number;
    name: string;
    status: string;
  }[];
};

type Identity = {
  id?: string;
  role?: RoleName;
  fullName?: string;
  email?: string;
  avatar?: string;
};

export default function Dashboard() {
  const { data: identity } = useGetIdentity<Identity>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity?.id) return;
    setIsLoading(true);
    fetch(`${BACKEND_BASE_URL}/api/users/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        setProfile(json.data);
        setEditName(json.data?.name || "");
        setEditImage(json.data?.image || "");
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [identity?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/users/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName, image: editImage }),
      });
      const json = await res.json();
      if (json.data) {
        setProfile((prev) => prev ? { ...prev, ...json.data } : prev);
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.name);
      setEditImage(profile.image || "");
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0]?.[0]?.toUpperCase() || "";
    if (names.length > 1) {
      initials += names[names.length - 1]?.[0]?.toUpperCase() || "";
    }
    return initials;
  };

  const isTeacher = profile?.role === "teacher";
  const isAdmin = profile?.role === "admin";
  const roleLabel = isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student";
  const roleVariant: "default" | "secondary" | "destructive" = isAdmin ? "destructive" : isTeacher ? "default" : "secondary";

  if (isLoading) {
    return (
      <ShowView>
        <ShowViewHeader resource="dashboard" title="Dashboard" />
        <p className="state-message">Loading profile...</p>
      </ShowView>
    );
  }

  if (!profile) {
    return (
      <ShowView>
        <ShowViewHeader resource="dashboard" title="Dashboard" />
        <p className="state-message">Failed to load profile.</p>
      </ShowView>
    );
  }

  return (
    <ShowView>
      <ShowViewHeader resource="dashboard" title="Dashboard" />

      <Card className="p-6 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className={cn("h-20", "w-20")}>
              <AvatarImage src={profile.image || undefined} alt={profile.name} />
              <AvatarFallback className={cn("text-lg")}>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge variant={roleVariant} className={cn("mt-1")}>{roleLabel}</Badge>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Separator className="my-4" />

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !editName.trim()}
              >
                {isSaving ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1 h-4 w-4" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="capitalize">{roleLabel}</p>
            </div>
            {profile.classes && profile.classes.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {isTeacher ? "Classes Teaching" : "Classes Joined"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.classes.map((cls) => (
                    <Badge
                      key={cls.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/classes/show/${cls.id}`)}
                    >
                      {cls.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isTeacher ? "Classes Teaching" : "Classes Joined"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {isTeacher
                    ? "Not assigned to any class yet."
                    : "Not enrolled in any class yet."}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </ShowView>
  );
}
