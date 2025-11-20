"use client";

import type { CompanyMemberWithUser } from "@/lib/data/companies";
import { WorkerPermissionsForm } from "./worker-permissions-form";

type CompanyMembersListProps = {
  members: CompanyMemberWithUser[];
  isAdmin: boolean;
  companyId: string;
};

export function CompanyMembersList({ members, isAdmin, companyId }: CompanyMembersListProps) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No hay miembros en la empresa todavía. Añade administradores o trabajadores para comenzar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const displayName = member.user.name || member.user.email || `Usuario ${member.user.id.slice(0, 8)}`;
        const displayEmail = member.user.email;

        return (
          <div
            key={member.id}
            className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{displayEmail}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    member.role === "admin"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {member.role === "admin" ? "Administrador" : "Trabajador"}
                </span>
              </div>
              {member.role === "worker" && (
                <div className="mt-2">
                  <WorkerPermissionsForm member={member} isAdmin={isAdmin} companyId={companyId} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
