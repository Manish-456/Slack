import React from "react";

interface WorkspaceIdPageProps {
  params: {
    workspaceId: string;
  };
}

export default function WorkspaceIdPage({
  params: { workspaceId },
}: WorkspaceIdPageProps) {
  return <div>ID: {workspaceId}</div>;
}
