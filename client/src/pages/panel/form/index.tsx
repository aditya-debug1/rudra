import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, ReceiptText, TicketCheck, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useAuth } from "@/store/auth/query";
import { hasPermission } from "@/hooks/use-role";
import ClientForm from "./client-form";
import ClientPartnerForm from "./cp-form";
import { BookingForm } from "./booking";
import { useMediaQuery } from "@/hooks/use-media-query";

type FormType = {
  id: string;
  label: string;
  permission: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

type FormPageId = "client" | "client-partner" | "booking";

// Function to validate if a value is a valid form page ID
function isValidFormPageId(value: string | undefined): value is FormPageId {
  if (!value) return false;
  return ["client", "client-partner", "booking"].includes(value);
}

const Form = () => {
  const { setBreadcrumbs } = useBreadcrumb();
  const { name } = useParams();
  const navigate = useNavigate();
  const { combinedRole } = useAuth(true);
  const isSmall = useMediaQuery("(min-width: 524px)");

  // Define available forms with their configurations
  const formTypes: FormType[] = useMemo(
    () => [
      {
        id: "client",
        label: "Client",
        permission: "client-form",
        icon: <User className="w-4 h-4 mr-2" />,
        component: <ClientForm />,
      },
      {
        id: "client-partner",
        label: "Client Partner",
        permission: "client-partner-form",
        icon: <Building2 className="h-4 w-4 mr-2" />,
        component: <ClientPartnerForm />,
      },
      {
        id: "booking",
        label: "Booking",
        permission: "booking-form",
        icon: <TicketCheck className="w-4 h-4 mr-2" />,
        component: <BookingForm />,
      },
    ],
    [],
  );

  // Filter forms based on permissions
  const availableForms = useMemo(
    () =>
      formTypes.filter((form) =>
        hasPermission(combinedRole, "Form", form.permission),
      ),
    [combinedRole, formTypes],
  );

  // Calculate total number of forms dynamically
  const totalForms = availableForms.length;

  // Determine which form to display based on permissions and URL param
  const defaultFormId = useMemo(() => {
    // Check if the URL parameter is valid
    if (
      isValidFormPageId(name) &&
      availableForms.some((form) => form.id === name)
    ) {
      return name;
    }

    // If URL param is invalid or missing, use the first available form
    return availableForms.length > 0 ? availableForms[0].id : "";
  }, [name, availableForms]);

  // Handle navigation between tabs
  const handleNavigate = (formId: string) => {
    navigate(`/panel/form/${formId}`);
  };

  // Set breadcrumbs on component mount
  useEffect(() => {
    setBreadcrumbs([{ label: "Form" }]);
  }, [setBreadcrumbs]);

  // Handle the case where no forms are available
  if (totalForms === 0) {
    return (
      <div className="w-full">
        <Card className="w-full shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ReceiptText className="w-6 h-6 text-primary" />
              Registration Forms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              You don't have permission to access any forms.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <ReceiptText className="w-6 h-6 text-primary" />
            Registration Form{totalForms > 1 && "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 w-full">
          <Tabs defaultValue={defaultFormId} className="w-full">
            {totalForms > 1 && (
              <TabsList
                className={`grid w-full  mx-auto mb-6`}
                style={{
                  maxWidth: `${totalForms * 200}px`,
                  gridTemplateColumns: `repeat(${totalForms}, 1fr)`,
                }}
              >
                {availableForms.map((form) => (
                  <TabsTrigger
                    key={form.id}
                    value={form.id}
                    onClick={() => handleNavigate(form.id)}
                  >
                    {form.icon} {isSmall && form.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            {availableForms.map((form) => (
              <TabsContent key={form.id} value={form.id}>
                {form.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
