import { Combobox } from "@/components/custom ui/combobox";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectOptions, requirementOptions } from "@/store/data/options";

import { ClientType, VisitType } from "@/store/client";

interface ClientData extends Omit<ClientType, "_id" | "visits"> {
  visitData: Omit<VisitType, "client" | "_id">;
}

type ClientFieldPath =
  | keyof ClientData
  | `visitData.${keyof Omit<VisitType, "client">}`;

interface ClientInfoProp {
  isEditable: boolean;
  client: ClientData;
  handleInputChange: (
    field: ClientFieldPath,
    value: string | number | Date,
  ) => void;
}

export const ClientInfo = ({
  isEditable,
  client,
  handleInputChange,
}: ClientInfoProp) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Client Information</h3>

      {/* Client Details - Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First Column */}
        <div className="space-y-4">
          <FormFieldWrapper
            className="gap-3"
            LabelText="Name"
            Important={isEditable}
            ImportantSide="right"
          >
            <div className="flex flex-col sm:flex-row gap-4 grow">
              <Input
                value={client.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="First Name"
                disabled={!isEditable}
              />
              <Input
                value={client.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="LastName Name"
                disabled={!isEditable}
              />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper className="gap-3" LabelText="Occupation">
            <Input
              value={client.occupation}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              placeholder="Software Engineer"
              disabled={!isEditable}
            />
          </FormFieldWrapper>

          <FormFieldWrapper className="gap-3" LabelText="Email">
            <Input
              value={client.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>

        {/* Second Column */}
        <div className="space-y-4 flex flex-col">
          <FormFieldWrapper
            className="gap-3"
            LabelText="Phone Number"
            Important={isEditable}
            ImportantSide="right"
          >
            <div className="flex flex-col sm:flex-row gap-4 grow">
              <Input
                value={client.phoneNo}
                onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                placeholder="Primary Number"
                disabled={!isEditable}
              />
              <Input
                value={client.altNo}
                onChange={(e) => handleInputChange("altNo", e.target.value)}
                placeholder="Alt Number (optional)"
                disabled={!isEditable}
              />
            </div>
          </FormFieldWrapper>
          <FormFieldWrapper className="gap-3 flex-grow" LabelText="Notes">
            <Textarea
              className="h-full lg:resize-none"
              value={client.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="Additional notes about the client"
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>

        {/* Third Column */}
        <div className="space-y-4">
          <FormFieldWrapper
            className="gap-3"
            LabelText="Project"
            Important={isEditable}
            ImportantSide="right"
          >
            <Combobox
              options={projectOptions}
              value={client.project}
              onChange={(e) => handleInputChange("project", e)}
              placeholder="Select project"
              emptyMessage="No project found"
              width="w-full"
              disabled={!isEditable}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            className="gap-3"
            LabelText="Requirement"
            Important={isEditable}
            ImportantSide="right"
          >
            <Combobox
              options={requirementOptions}
              value={client.requirement}
              onChange={(e) => handleInputChange("requirement", e)}
              placeholder="Select requirement"
              emptyMessage="No requirement found"
              width="w-full"
              disabled={!isEditable}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            className="gap-3"
            LabelText="Budget"
            Important={isEditable}
            ImportantSide="right"
          >
            <div className="flex flex-col sm:flex-row gap-4 grow">
              <Input
                type="number"
                value={client.budget}
                disabled={!isEditable}
                onChange={(e) =>
                  handleInputChange("budget", Number(e.target.value))
                }
                placeholder="0"
              />
              {/* <Select
                value={budgetUnit.toString()}
                onValueChange={handleUnitChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Budget Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Units</SelectLabel>
                    {budgetOptions.map((unit, index) => {
                      return (
                        <SelectItem value={unit.value.toString()} key={index}>
                          {unit.label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
            </div>
          </FormFieldWrapper>
        </div>
      </div>

      {/* Address - Full Width */}
      <FormFieldWrapper className="gap-3" LabelText="Address">
        <Textarea
          className="min-h-20"
          value={client.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="123 Main Street, Anytown, State, 12345"
          disabled={!isEditable}
        />
      </FormFieldWrapper>
    </div>
  );
};
