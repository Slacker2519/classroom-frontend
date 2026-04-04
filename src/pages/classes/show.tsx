import { useShow, useGetIdentity, useCreate } from "@refinedev/core";
import { ClassDetails } from "@/types";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary.ts";
import { RoleName } from "@/lib/permissions";
import { Loader2, Users } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "@/constants";

const Show = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity<{ role?: RoleName; id?: string }>();
  const navigate = useNavigate();
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const classDetails = query.data?.data;
  const { isLoading, isError } = query;
  const { mutate: createJoinRequest } = useCreate();
  const [requested, setRequested] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    if (!classId || !identity?.id) return;
    fetch(
      `${BACKEND_BASE_URL}/api/enrollments?classId=${classId}&studentId=${identity.id}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((json) => {
        setIsEnrolled(!!(json.data && json.data.length > 0));
      });
  }, [classId, identity?.id]);

  useEffect(() => {
    if (!classId || !identity?.id) return;
    fetch(
      `${BACKEND_BASE_URL}/api/class-join-requests?classId=${classId}&studentId=${identity.id}&status=pending`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((json) => {
        setHasPendingRequest(!!(json.data && json.data.length > 0));
      });
  }, [classId, identity?.id]);

  const isTeacherOfClass = identity?.id === classDetails?.teacher?.id;
  const isAdmin = identity?.role === "admin";
  const isStudent = identity?.role === "student";
  const isTeacher = identity?.role === "teacher";
  const canViewJoinRequests = (isTeacher && isTeacherOfClass) || isAdmin;

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />

        <p className="state-message">
          {isLoading
            ? "Loading class details..."
            : isError
            ? "Failed to load class details..."
            : "Class details not found."}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teachersInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teachersInitials || "NA"
  )}`;

  const {
    name,
    description,
    status,
    capacity,
    bannerCldPubId,
    subject,
    teacher,
    department,
  } = classDetails;

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {bannerCldPubId ? (
          <AdvancedImage
            alt="Class Banner"
            cldImg={bannerPhoto(bannerCldPubId ?? "", name)}
          />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div className="details-header">
          <div>
            <h1>{name}</h1>
            <p>{description}</p>
          </div>

          <div>
            <Badge variant="outline">{capacity} spots</Badge>
            <Badge
              variant={status === "active" ? "default" : "secondary"}
              data-status={status ?? "unknown"}
            >
              {(status ?? "unknown").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="details-grid">
          <div className="instructor">
            <p>Instructor</p>
            <div>
              <img src={teacher?.image ?? placeholderUrl} alt={teacherName} />

              <div>
                <p>{teacherName}</p>
                <p>{teacher?.email}</p>
              </div>
            </div>
          </div>

          <div className="department">
            <p>Department</p>

            <div>
              <p>{department?.name}</p>
              <p>{department?.description}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="subject">
          <p>Subject</p>

          <div>
            <Badge variant="outline">Code: {subject?.code}</Badge>
            <p>{subject?.name}</p>
            <p>{subject?.description}</p>
          </div>
        </div>

        <Separator />

        {(isTeacher && isTeacherOfClass) || isAdmin ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate(`/classes/members/${classId}`)}
          >
            <Users className="mr-2 h-4 w-4" />
            View Class Members
          </Button>
        ) : null}

        {isStudent && !isEnrolled && (
          <>
            <div className="join">
              <h2>Join Class</h2>
              {requested || hasPendingRequest ? (
                <p className="text-muted-foreground">
                  Your join request is pending teacher approval.
                </p>
              ) : (
                <ol>
                  <li>Request to Join</li>
                  <li>Wait for teacher to approve</li>
                </ol>
              )}
            </div>

            {requested || hasPendingRequest ? (
              <Button size="lg" className="w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pending
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  createJoinRequest({
                    resource: "class-join-requests",
                    values: { classId: Number(classId) },
                    onSuccess: () => setRequested(true),
                  });
                }}
              >
                Request to Join
              </Button>
            )}
          </>
        )}

        {canViewJoinRequests && (
          <>
            <div className="join">
              <h2>Enrollment Requests</h2>
              <p className="text-muted-foreground">
                Review and manage student join requests for this class.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate(`/classes/join-requests/${classId}`)}
            >
              <Users className="mr-2 h-4 w-4" />
              View Join Requests
            </Button>
          </>
        )}

        {isStudent && isEnrolled && (
          <>
            <div className="join">
              <h2>You are enrolled</h2>
              <p className="text-muted-foreground">
                You are a member of this class.
              </p>
            </div>
            <Button size="lg" className="w-full" disabled>
              Enrolled
            </Button>
          </>
        )}
      </Card>
    </ShowView>
  );
};

export default Show;
