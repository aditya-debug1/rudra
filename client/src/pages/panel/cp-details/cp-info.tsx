import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClientPartnerType } from "@/store/client-partner";
import { Globe } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Client Partner Information</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
            <FormFieldWrapper
              LabelText="Company Name"
              Important={isEditable}
              ImportantSide="right"
            >
              <Input
                value={data.name}
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
                value={data.ownerName}
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                placeholder="Enter owner name"
                disabled={!isEditable}
              />
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper LabelText="Email">
            <Input
              value={data.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={isEditable ? "Enter email" : "N/A"}
              disabled={!isEditable}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            LabelText="Phone Number"
            Important={isEditable}
            ImportantSide="right"
          >
            <Input
              value={data.phoneNo}
              onChange={(e) => handleInputChange("phoneNo", e.target.value)}
              placeholder="Enter phone number"
              disabled={!isEditable}
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
                value={data.companyWebsite}
                onChange={(e) =>
                  handleInputChange("companyWebsite", e.target.value)
                }
                placeholder={isEditable ? "e.g. www.company-name.com" : "N/A"}
                className="rounded-l-none"
                disabled={!isEditable}
              />
            </div>
          </FormFieldWrapper>
          <FormFieldWrapper LabelText="Address" className="gap-3 flex-grow">
            <Textarea
              className="h-full lg:resize-none"
              value={data.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={isEditable ? "Enter company address" : "N/A"}
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>

        <div className="space-y-4 flex flex-col">
          <FormFieldWrapper LabelText="Notes" className="gap-3 flex-grow">
            <Textarea
              className="h-full lg:resize-none"
              value={data.address}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder={
                isEditable ? "Additional info about company..." : "N/A"
              }
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>
      </div>
    </div>
  );
};
