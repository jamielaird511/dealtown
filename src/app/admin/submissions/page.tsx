import { createClient } from "@/lib/supabase/server";
import { DealSubmission } from "@/lib/types";
import { formatDayOfWeek, formatPrice } from "@/lib/format";
import { ApproveButton } from "@/components/ApproveButton";

export const dynamic = "force-dynamic";

async function getUnapprovedSubmissions(): Promise<DealSubmission[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("deal_submissions")
    .select("*")
    .is("approved_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }

  return data || [];
}

export default async function AdminSubmissionsPage() {
  const submissions = await getUnapprovedSubmissions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Deal Submissions</h1>
        <p className="text-muted-foreground">
          Review and approve community-submitted deals
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No pending submissions at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission }: { submission: DealSubmission }) {
  const formatTime = (time?: string) => {
    if (!time) return null;
    // Time is already in HH:MM format from the form
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{submission.title}</h3>
          <p className="text-sm text-muted-foreground">
            {submission.venue_name}
            {submission.venue_suburb && ` • ${submission.venue_suburb}`}
          </p>
        </div>
        <ApproveButton submissionId={submission.id} />
      </div>

      {submission.description && (
        <p className="mb-4 text-sm text-muted-foreground">
          {submission.description}
        </p>
      )}

      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {submission.price_cents !== null && submission.price_cents !== undefined && (
          <div>
            <span className="font-medium">Price:</span>{" "}
            <span className="text-primary font-bold">
              {formatPrice(submission.price_cents)}
            </span>
          </div>
        )}

        {submission.day_of_week !== null && submission.day_of_week !== undefined && (
          <div>
            <span className="font-medium">Day:</span>{" "}
            {formatDayOfWeek(submission.day_of_week)}
          </div>
        )}

        {(submission.start_time || submission.end_time) && (
          <div>
            <span className="font-medium">Time:</span>{" "}
            {submission.start_time && formatTime(submission.start_time)}
            {submission.start_time && submission.end_time && " – "}
            {submission.end_time && formatTime(submission.end_time)}
          </div>
        )}

        {submission.contact && (
          <div>
            <span className="font-medium">Contact:</span>{" "}
            <a href={`mailto:${submission.contact}`} className="text-primary hover:underline">
              {submission.contact}
            </a>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Submitted: {new Date(submission.created_at).toLocaleString()}
      </div>
    </div>
  );
}

