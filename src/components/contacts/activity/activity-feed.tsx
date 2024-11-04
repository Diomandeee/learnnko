"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ActivityIcon } from "./activity-icon";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityMetadata {
  [key: string]: unknown; // You can be more specific about the key-value pairs as your app grows
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata: ActivityMetadata; // Updated metadata type
}

interface ActivityFeedProps {
  contactId: string;
}

export function ActivityFeed({ contactId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(`/api/contacts/${contactId}/activities`);
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [contactId]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 text-sm">
            <ActivityIcon type={activity.type} />
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">No activity yet</p>
        )}
      </div>
    </ScrollArea>
  );
}