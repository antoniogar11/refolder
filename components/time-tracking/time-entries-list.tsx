"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeEntryWithRelations } from "@/lib/data/time-tracking";
import { formatDuration } from "@/lib/utils";

type TimeEntriesListProps = {
  entries: TimeEntryWithRelations[];
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(dateString),
  );
}

function formatTime(timeString: string | null) {
  if (!timeString) return "";
  // timeString está en formato HH:mm
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}

export function TimeEntriesList({ entries }: TimeEntriesListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Tiempo</CardTitle>
          <CardDescription>No hay registros de tiempo todavía</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isActive = entry.end_time === null;
        const duration = entry.duration_minutes;

        return (
          <Link key={entry.id} href={`/dashboard/control-horario/${entry.id}`}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isActive ? "border-blue-500 dark:border-blue-400" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <span className={`text-sm font-semibold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {isActive ? "▶" : "■"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {entry.description || "Sin descripción"}
                        </p>
                        {isActive && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                            En curso
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                        <span>{formatDate(entry.entry_date)}</span>
                        {entry.start_time && (
                          <>
                            <span>•</span>
                            <span>
                              {formatTime(entry.start_time)}
                              {entry.end_time ? ` - ${formatTime(entry.end_time)}` : " - ..."}
                            </span>
                          </>
                        )}
                        {entry.assigned_user && (
                          <>
                            <span>•</span>
                            <span className="font-medium">Trabajador: {entry.assigned_user.name || entry.assigned_user.email || entry.assigned_user.id}</span>
                          </>
                        )}
                        {entry.project && (
                          <>
                            <span>•</span>
                            <span>Obra: {entry.project.name}</span>
                          </>
                        )}
                        {entry.task && (
                          <>
                            <span>•</span>
                            <span>Tarea: {entry.task.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 text-right">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {formatDuration(duration)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

