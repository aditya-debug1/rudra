import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { ClientPartnerType } from "@/store/client-partner";
import { Clock, Globe, User } from "lucide-react";

interface ClientPartnerInfoProps {
  isEditable: boolean;
  data: ClientPartnerType;
  handleInputChange: (field: keyof ClientPartnerType, value: string) => void;
}

export const ClientPartnerInfo = ({
  isEditable = false,
  data,
  handleInputChange,
}: ClientPartnerInfoProps) => {
  const { combinedRole } = useAuth(true);
  const showContacts = hasPermission(
    combinedRole,
    "ClientPartner",
    "view-cp-contacts",
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Channel Partner Information</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
            <FormFieldWrapper
              LabelText="Company Name"
              Important={isEditable}
              ImportantSide="right"
            >
              <Input
                value={data.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter company name"
                disabled={!isEditable}
              />
            </FormFieldWrapper>
            <FormFieldWrapper
              LabelText="Owner Name"
              Important={isEditable}
              ImportantSide="right"
            >
              <Input
                value={data.ownerName || ""}
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                placeholder="Enter owner name"
                disabled={!isEditable}
              />
            </FormFieldWrapper>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
            <FormFieldWrapper LabelText="CP ID">
              <Input value={data.cpId || ""} disabled />
            </FormFieldWrapper>
            <FormFieldWrapper LabelText="Email">
              <Input
                value={showContacts ? data.email || "" : "Access Denied"}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={isEditable ? "Enter email" : "N/A"}
                disabled={!isEditable || !showContacts}
              />
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper
            LabelText="Phone Number"
            Important={isEditable}
            ImportantSide="right"
          >
            <Input
              value={showContacts ? data.phoneNo || "" : "Access Denied"}
              onChange={(e) => handleInputChange("phoneNo", e.target.value)}
              placeholder="Enter phone number"
              disabled={!isEditable || !showContacts}
            />
          </FormFieldWrapper>
        </div>

        <div className="space-y-4 flex flex-col">
          <FormFieldWrapper LabelText="Website">
            <div className="flex">
              <div className="p-2 flex items-center rounded-l-md border border-r-0">
                <Globe className="h-4 w-4 text-foreground" />
              </div>
              <Input
                value={
                  showContacts ? data.companyWebsite || "" : "Access Denied"
                }
                onChange={(e) =>
                  handleInputChange("companyWebsite", e.target.value)
                }
                placeholder={isEditable ? "e.g. www.company-name.com" : "N/A"}
                className="rounded-l-none"
                disabled={!isEditable || !showContacts}
              />
            </div>
          </FormFieldWrapper>
          <FormFieldWrapper LabelText="Address" className="gap-3 flex-grow">
            <Textarea
              className="h-full lg:resize-none"
              value={showContacts ? data.address || "" : "Access Denied"}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={isEditable ? "Enter company address" : "N/A"}
              disabled={!isEditable || !showContacts}
            />
          </FormFieldWrapper>
        </div>

        <div className="space-y-4 flex flex-col">
          <FormFieldWrapper LabelText="Notes" className="gap-3 flex-grow">
            <Textarea
              className="h-full lg:resize-none"
              value={data.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder={
                isEditable ? "Additional info about company..." : "N/A"
              }
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Professional audit trail section */}
      <div className="mt-8">
        <Separator className="mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          {/* Created info */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Created by</span>
            <Badge variant="secondary" className="text-xs">
              {data.createdBy || "Unknown"}
            </Badge>
            <span>on</span>
            <time className="font-medium text-foreground">
              {formatDate(data.createdAt)}
            </time>
          </div>

          {/* Updated info */}
          {data.updatedBy && data.updatedAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated by</span>
              <Badge variant="outline" className="text-xs">
                {data.updatedBy}
              </Badge>
              <span>on</span>
              <time className="font-medium text-foreground">
                {formatDateTime(data.updatedAt)}
              </time>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
