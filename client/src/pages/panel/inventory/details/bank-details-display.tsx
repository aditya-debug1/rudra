import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, CreditCard, GitBranch, Banknote } from "lucide-react";

interface BankDetailsDisplayProps {
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: "saving" | "current";
}

export const BankDetailsDisplay = ({
  holderName,
  accountNumber,
  name,
  branch,
  ifscCode,
  accountType,
}: BankDetailsDisplayProps) => {
  const getAccountTypeBadgeColor = (type: "saving" | "current") => {
    return type === "saving"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  const getAccountTypeLabel = (type: "saving" | "current") => {
    return type === "saving" ? "Saving Account" : "Current Account";
  };

  return (
    <Card className="border-l-4 border-l-amber-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5 text-amber-500" />
            Bank Details
          </CardTitle>
          <Badge className={getAccountTypeBadgeColor(accountType)}>
            {getAccountTypeLabel(accountType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Holder Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <User className="h-4 w-4" />
              Account Holder
            </div>
            <p className="text-sm font-medium text-foreground">{holderName}</p>
          </div>

          {/* Bank Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Building2 className="h-4 w-4" />
              Bank Name
            </div>
            <p className="text-sm font-medium text-foreground">{name}</p>
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <CreditCard className="h-4 w-4" />
              Account Number
            </div>
            <p className="text-sm font-medium text-foreground font-mono tracking-wider">
              {accountNumber}
            </p>
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <GitBranch className="h-4 w-4" />
              Branch
            </div>
            <p className="text-sm font-medium text-foreground">{branch}</p>
          </div>

          {/* IFSC Code */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <CreditCard className="h-4 w-4" />
              IFSC Code
            </div>
            <p className="text-sm font-medium text-foreground font-mono tracking-widest">
              {ifscCode}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
