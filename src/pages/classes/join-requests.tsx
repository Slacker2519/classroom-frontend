import { ClassJoinRequest } from "@/types";
import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "@/constants";

const JoinRequests = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [requests, setRequests] = useState<ClassJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    setIsLoading(true);
    fetch(`${BACKEND_BASE_URL}/api/class-join-requests?classId=${classId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        setRequests(json.data || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [classId]);

  const refetch = () => {
    if (!classId) return;
    fetch(`${BACKEND_BASE_URL}/api/class-join-requests?classId=${classId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => setRequests(json.data || []));
  };

  const handleResponse = async (
    requestId: number,
    newStatus: "accepted" | "declined"
  ) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/class-join-requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update request");
      }
      refetch();
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <ListView>
        <Breadcrumb />
        <p className="state-message">Loading join requests...</p>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/classes/show/${classId}`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Class
        </Button>
      </div>

      <h1 className="page-title">Join Requests</h1>
      <div className="intro-row">
        <p>Manage student join requests for this class.</p>
      </div>

      <Separator />

      {requests.length === 0 ? (
        <p className="text-muted-foreground">
          No join requests for this class.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {request.student?.name || "Unknown Student"}
                    </p>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.student?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested on{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      disabled={processingId === request.id}
                      onClick={() => handleResponse(request.id, "accepted")}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      disabled={processingId === request.id}
                      onClick={() => handleResponse(request.id, "declined")}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </ListView>
  );
};

export default JoinRequests;
