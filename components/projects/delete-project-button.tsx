"use client";

import { deleteProjectAction } from "@/app/dashboard/proyectos/actions";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  return (
    <DeleteEntityButton
      entityId={projectId}
      entityName={projectName}
      redirectPath="/dashboard/proyectos"
      onDelete={deleteProjectAction}
    />
  );
}
