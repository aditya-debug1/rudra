import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { setBreadcrumbs } = useBreadcrumb();
  const { combinedRole } = useAuth(false);

  const showRoles =
    hasPermission(combinedRole, "Settings", "read-role") ||
    hasPermission(combinedRole, "Settings", "update-role");
  const showAudits = hasPermission(combinedRole, "Settings", "read-audit");

  useEffect(() => {
    setBreadcrumbs([{ label: "Settings" }]);
  }, [setBreadcrumbs]);

  const NavLinks = [
    { PageName: "Roles", path: "roles", show: showRoles },
    { PageName: "Audit", path: "audit", show: showAudits },
  ];

  return (
    <Card className="w-full overflow-hidden">
      <Table>
        <TableBody>
          {NavLinks.filter((link) => link.show).map((link) => (
            <TableRow key={link.path} className="hover:bg-card">
              <TableCell>{link.PageName}</TableCell>
              <TableCell className="text-right">
                <Link to={link.path}>
                  <Button size="miniIcon" variant="secondary">
                    <ChevronRight size={20} />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default Settings;
