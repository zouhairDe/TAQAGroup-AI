"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EquipmentAutocomplete } from "@/components/ui/equipment-autocomplete";
import { Equipment } from "@/types/database-types";

interface RexEntry {
  id: string;
  title: string;
  description: string;
  building?: string;
  equipment?: string;
  summary?: string;
  effectiveness?: number;
  status: "draft" | "pending_review" | "approved" | "rejected";
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function EditRexPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rexEntry, setRexEntry] = useState<RexEntry | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    const fetchRexEntry = async () => {
      try {
        const response = await fetch(`/api/rex/${params.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch REX entry");
        }

        setRexEntry(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRexEntry();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/rex/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: rexEntry?.title,
          description: rexEntry?.description,
          building: rexEntry?.building,
          equipment: rexEntry?.equipment,
          summary: rexEntry?.summary,
          effectiveness: rexEntry?.effectiveness,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update REX entry");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/rex/${params.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          variant="error"
          title="Error"
          message={error}
        />
      </div>
    );
  }

  if (!rexEntry) {
    return (
      <div className="p-6">
        <Alert
          variant="error"
          title="Not Found"
          message="REX entry not found"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Edit REX Entry
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update the details of this REX entry
          </p>
        </div>
        <Badge variant="light" color="primary">
          {rexEntry.status.toUpperCase()}
        </Badge>
      </div>

      {success && (
        <Alert
          variant="success"
          title="Success"
          message="REX entry updated successfully"
          className="mb-6"
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Title
            </label>
            <Input
              id="title"
              value={rexEntry.title}
              onChange={(e) =>
                setRexEntry({ ...rexEntry, title: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={rexEntry.description}
              onChange={(e) =>
                setRexEntry({ ...rexEntry, description: e.target.value })
              }
              className="mt-1"
              rows={6}
              required
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Summary
            </label>
            <Textarea
              id="summary"
              value={rexEntry.summary || ""}
              onChange={(e) =>
                setRexEntry({ ...rexEntry, summary: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="building"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Building
              </label>
              <Input
                id="building"
                value={rexEntry.building || ""}
                onChange={(e) =>
                  setRexEntry({ ...rexEntry, building: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <EquipmentAutocomplete
                value={rexEntry.equipment || ""}
                onChange={(value, equipment) => {
                  setRexEntry({ ...rexEntry, equipment: value });
                  if (equipment) {
                    setSelectedEquipment(equipment);
                  }
                }}
                onEquipmentSelect={(equipment) => {
                  setSelectedEquipment(equipment);
                  setRexEntry({ ...rexEntry, equipment: equipment.name });
                }}
                label="Equipment"
                placeholder="Search for equipment..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="effectiveness"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Effectiveness (0-100)
            </label>
            <Input
              id="effectiveness"
              type="number"
              min="0"
              max="100"
              value={rexEntry.effectiveness || ""}
              onChange={(e) =>
                setRexEntry({
                  ...rexEntry,
                  effectiveness: parseInt(e.target.value) || undefined,
                })
              }
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 