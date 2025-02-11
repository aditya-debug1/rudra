import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: "Settings" }]);
  }, [setBreadcrumbs]);

  const NavLinks = [
    { PageName: "Roles", path: "roles" },
    { PageName: "Audit", path: "audit" },
  ];

  return (
    <Card className="w-full overflow-hidden">
      <Table>
        <TableBody>
          {NavLinks.map((link) => {
            return (
              <TableRow className="hover:bg-card">
                <TableCell>{link.PageName}</TableCell>
                <TableCell className="text-right">
                  <Link to={link.path}>
                    <Button size="miniIcon" variant="secondary">
                      <ChevronRight size={20} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default Settings;
