import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle, XOctagon } from "lucide-react";

interface ErrorCardProps {
  title: string;
  description: string;
  btnTitle: string;
  onAction: () => void;
  className?: string;
}

const ErrorCard = ({
  title = "Something went wrong",
  description = "There was an error loading this content.",
  btnTitle,
  onAction,
  className = "",
}: ErrorCardProps) => {
  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <XCircle className="h-6 w-6 text-destructive" />
          <CardTitle className="text-destructive">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onAction}>
          {btnTitle}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const AccessDenied = ({
  title = null,
  description = null,
}: {
  title?: string | null;
  description?: string | null;
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <XOctagon className="w-12 h-12 mx-auto text-destructive mb-2" />
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle className="text-lg font-semibold">
            {title ?? "Access Denied"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {description ??
              "You don't have permission to access this resource. Please contact your administrator if you believe this is a mistake."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
