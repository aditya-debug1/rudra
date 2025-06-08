import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuthLogType } from "@/store/auth";
import { usersSummaryType, useUsersSummary } from "@/store/users";
import { toProperCase } from "@/utils/func/strUtils";

interface AuthTableProps {
  data: AuthLogType[];
}

const getActionClr = (action: string) => {
  switch (action) {
    case "login":
      return "success";
    case "logout":
      return "destructive";
    default:
      return "default";
  }
};

const getActorName = (
  username: string,
  managers: usersSummaryType[] | undefined,
) => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? manager.firstName + " " + manager.lastName : username;
};

const getActorRoles = (
  username: string,
  managers: usersSummaryType[] | undefined,
) => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? manager.roles.join(", ") : "N/A";
};

export const AuthTable = ({ data }: AuthTableProps) => {
  const { data: managers } = useUsersSummary();
  return (
    <Card className="w-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("en-GB", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {getActorName(log.username, managers || [])}
                </TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>
                  {getActorRoles(log.username, managers || [])}
                </TableCell>
                <TableCell>
                  <Badge variant={getActionClr(log.action)}>
                    {toProperCase(log.action)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-card">
              <TableCell colSpan={4} className="text-center">
                No logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
