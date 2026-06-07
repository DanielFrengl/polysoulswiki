"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { setUserRole } from "@/app/wiki/admin/action";
import type { AdminUserRow, Role } from "@/lib/types";

const ROLES: Role[] = ["reader", "editor", "admin"];

export default function AdminUsers({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, role: Role) => {
    startTransition(async () => {
      const result = await setUserRole(userId, role);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Role updated.");
      router.refresh();
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="w-40">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name}
                {user.username && (
                  <span className="ml-1 text-muted-foreground">
                    @{user.username}
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                {user.email}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  disabled={pending}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value as Role)
                  }
                >
                  <SelectTrigger className="w-32" aria-label="Role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
