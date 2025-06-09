import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";

export default function TargetForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Target size={24} className="mt-0.5" />
          Target Form
        </CardTitle>
        <CardDescription>
          Assign monthly booking targets to employees
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
