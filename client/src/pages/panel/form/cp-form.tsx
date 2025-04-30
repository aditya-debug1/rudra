import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClientPartners } from "@/store/client-partner";
import { capitalizeWords, formatAddress } from "@/utils/func/strUtils";
import { formatZodErrors } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { ClientPartnerSchema } from "@/utils/zod-schema/client-partner";
import { Building2, Globe, User } from "lucide-react";
import { useRef, useState } from "react";

const generateCPId = (companyName: string): string => {
  const initials = companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase(); // Extract initials from company name

  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp

  return `CP-${initials}-${timestamp}`; // Example: "CP-XYZ-654321"
};

export default function ClientPartnerForm() {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const { createClientPartnerMutation } = useClientPartners();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValue = {
    company: {
      name: "",
      ownerName: "",
      email: "",
      phoneNo: "",
      address: "",
      notes: "",
      companyWebsite: "",
    },
    employee: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      altNo: "",
      position: "",
      commissionPercentage: "",
    },
  };
  const [formData, setFormData] = useState(defaultValue);

  const handleCompanyChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      company: {
        ...formData.company,
        [name]: value,
      },
    });
  };

  const handleEmployeeChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      employee: {
        ...formData.employee,
        [name]: value,
      },
    });
  };

  const handleSubmit = async () => {
    const validation = ClientPartnerSchema.safeParse(formData);

    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.error.errors);

      toast({
        title: "Form Validation Error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    const commissionPercentage = formData.employee.commissionPercentage
      ? parseFloat(formData.employee.commissionPercentage)
      : 0;

    const formattedData = {
      cpId: generateCPId(formData.company.name),
      name: formData.company.name,
      ownerName: formData.company.ownerName,
      email: formData.company.email,
      phoneNo: formData.company.phoneNo,
      address: formatAddress(formData.company.address),
      notes: formData.company.notes,
      website: formData.company.companyWebsite, // Changed companyWebsite to website to match the API
      employees: [
        {
          firstName: formData.employee.firstName,
          lastName: formData.employee.lastName,
          email: formData.employee.email,
          phoneNo: formData.employee.phoneNo,
          altNo: formData.employee.altNo,
          position: formData.employee.position,
          commissionPercentage, // Using the fixed value
        },
      ],
    };

    // Actual client creation logic goes here
    try {
      console.log(formattedData);
      setIsSubmitting(true);
      await createClientPartnerMutation.mutateAsync(formattedData);

      toast({
        title: "Success",
        description: "Client Partner created successfully",
        variant: "success",
      });

      setFormData(defaultValue);
      setIsSubmitting(false);
    } catch (error) {
      const Err = error as CustomAxiosError;
      if (Err.response?.data.error) {
        toast({
          title: "Error occurred",
          description: `Failed to create client partner. ${Err.response?.data.error}`,
          variant: "destructive",
        });
      } else
        toast({
          title: "Error occurred",
          description: "Failed to create client partner. Please try again.",
          variant: "destructive",
        });

      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-0 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Enter the client partner company details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldWrapper
                  LabelText="Company Name"
                  Important
                  ImportantSide="right"
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. TechCorp Pvt Ltd"
                    ref={nameRef}
                    value={formData.company.name}
                    onChange={(e) =>
                      handleCompanyChange(
                        e.target.name,
                        e.target.value.toUpperCase(),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Tab" && e.shiftKey) {
                        e.preventDefault();
                        submitRef.current?.focus();
                      }
                    }}
                  />
                </FormFieldWrapper>
                <FormFieldWrapper
                  LabelText="Owner Name"
                  Important
                  ImportantSide="right"
                >
                  <Input
                    id="ownerName"
                    name="ownerName"
                    placeholder="e.g. John Doe"
                    value={formData.company.ownerName}
                    onChange={(e) =>
                      handleCompanyChange(
                        e.target.name,
                        capitalizeWords(e.target.value),
                      )
                    }
                  />
                </FormFieldWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldWrapper LabelText="Email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.company.email}
                    onChange={(e) =>
                      handleCompanyChange(
                        e.target.name,
                        e.target.value.toLowerCase(),
                      )
                    }
                  />
                </FormFieldWrapper>
                <FormFieldWrapper
                  LabelText="Phone Number"
                  Important
                  ImportantSide="right"
                >
                  <Input
                    id="phoneNo"
                    name="phoneNo"
                    placeholder="Contact"
                    value={formData.company.phoneNo}
                    onChange={(e) =>
                      handleCompanyChange(e.target.name, e.target.value)
                    }
                  />
                </FormFieldWrapper>
              </div>

              <FormFieldWrapper LabelText="Website">
                <div className="flex">
                  <div className="p-2 flex items-center rounded-l-md border border-r-0">
                    <Globe className="h-4 w-4 text-foreground" />
                  </div>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    placeholder="e.g. www.company-name.com"
                    value={formData.company.companyWebsite}
                    className="rounded-l-none"
                    onChange={(e) =>
                      handleCompanyChange(
                        e.target.name,
                        e.target.value.toLowerCase(),
                      )
                    }
                  />
                </div>
              </FormFieldWrapper>

              <FormFieldWrapper LabelText="Address">
                <Textarea
                  id="address"
                  name="address"
                  className="h-20"
                  placeholder="e.g. 123 Main Street, Anytown, State, 12345"
                  value={formData.company.address}
                  onChange={(e) =>
                    handleCompanyChange(e.target.name, e.target.value)
                  }
                />
              </FormFieldWrapper>

              <FormFieldWrapper LabelText="Notes">
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional info about the company"
                  value={formData.company.notes}
                  onChange={(e) =>
                    handleCompanyChange(e.target.name, e.target.value)
                  }
                />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>

        {/* Employee Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Primary Employee
            </CardTitle>
            <CardDescription>
              Enter details of the main contact person
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormFieldWrapper
                LabelText="Name"
                Important
                ImportantSide="right"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.employee.firstName}
                    onChange={(e) =>
                      handleEmployeeChange(
                        e.target.name,
                        capitalizeWords(e.target.value),
                      )
                    }
                  />
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.employee.lastName}
                    onChange={(e) =>
                      handleEmployeeChange(
                        e.target.name,
                        capitalizeWords(e.target.value),
                      )
                    }
                  />
                </div>
              </FormFieldWrapper>

              <FormFieldWrapper LabelText="Email">
                <Input
                  id="empEmail"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.employee.email}
                  onChange={(e) =>
                    handleEmployeeChange(
                      e.target.name,
                      e.target.value.toLowerCase(),
                    )
                  }
                />
              </FormFieldWrapper>
              <FormFieldWrapper
                LabelText="Phone Number"
                Important
                ImportantSide="right"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="empPhoneNo"
                    name="phoneNo"
                    placeholder="Primary Number"
                    value={formData.employee.phoneNo}
                    onChange={(e) =>
                      handleEmployeeChange(e.target.name, e.target.value)
                    }
                  />
                  <Input
                    id="altNo"
                    name="altNo"
                    placeholder="Alt Number (optional)"
                    value={formData.employee.altNo}
                    onChange={(e) =>
                      handleEmployeeChange(e.target.name, e.target.value)
                    }
                  />
                </div>
              </FormFieldWrapper>

              <FormFieldWrapper LabelText="Position">
                <Input
                  id="position"
                  name="position"
                  placeholder="e.g. Sales Manager"
                  value={formData.employee.position}
                  onChange={(e) =>
                    handleEmployeeChange(
                      e.target.name,
                      capitalizeWords(e.target.value),
                    )
                  }
                />
              </FormFieldWrapper>

              <FormFieldWrapper LabelText="Commission Percentage">
                <Input
                  id="commissionPercentage"
                  name="commissionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 5"
                  value={formData.employee.commissionPercentage}
                  onChange={(e) =>
                    handleEmployeeChange(e.target.name, e.target.value)
                  }
                />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          ref={submitRef}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !e.shiftKey) {
              e.preventDefault(); // prevent natural tabbing
              nameRef.current?.focus();
            }
          }}
        >
          Add Client Partner
        </Button>
      </div>
    </div>
  );
}
