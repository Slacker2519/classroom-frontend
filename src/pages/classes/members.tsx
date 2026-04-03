import { useList, useOne } from "@refinedev/core";
import { ClassDetails } from "@/types";
import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router";

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "teacher" | "student";
};

const ClassMembers = () => {
  const { classId } = useParams<{ classId: string }>();
  const { data: classData } = useOne<ClassDetails>({
    resource: "classes",
    id: classId,
  });

  const { data: enrollmentData, isLoading } = useList({
    resource: "enrollments",
    filters: [
      {
        field: "classId",
        operator: "eq",
        value: classId ? Number(classId) : undefined,
      },
    ],
  });

  const classDetails = classData?.data;
  const teacher = classDetails?.teacher;
  const enrollments = enrollmentData?.data || [];

  const members: Member[] = [
    ...(teacher
      ? [
          {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            image: teacher.image,
            role: "teacher" as const,
          },
        ]
      : []),
    ...enrollments.map((e: any) => ({
      id: e.student?.id || e.studentId,
      name: e.student?.name || "Unknown",
      email: e.student?.email || "",
      image: e.student?.image || null,
      role: "student" as const,
    })),
  ];

  const placeholderUrl = "https://placehold.co/100x100?text=NA";

  if (isLoading) {
    return (
      <ListView>
        <Breadcrumb />
        <p className="state-message">Loading members...</p>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />

      <h1 className="page-title">Class Members</h1>
      <div className="intro-row">
        <p>
          {members.length} member{members.length !== 1 ? "s" : ""} in this
          class.
        </p>
      </div>

      <Separator />

      <div className="space-y-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <img
              src={member.image || placeholderUrl}
              alt={member.name || "Member"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Badge
              variant={member.role === "teacher" ? "default" : "secondary"}
            >
              {member.role === "teacher" ? "Teacher" : "Student"}
            </Badge>
          </div>
        ))}
      </div>
    </ListView>
  );
};

export default ClassMembers;
