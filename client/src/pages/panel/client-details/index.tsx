import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientInfo } from "./client-info";

import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { ClientType, useClients, useClientStore } from "@/store/client";
import { BookmarkPlus, Save, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { VisitInfo } from "./visit-info";
import { useNavigate, useParams } from "react-router-dom";
import { CenterWrapper } from "@/components/custom ui/center-page";
import { Loader } from "@/components/custom ui/loader";
import ErrorCard from "@/components/custom ui/error-display";
import { CustomAxiosError } from "@/utils/types/axios";
import { useAuth } from "@/store/auth";
import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { useToast } from "@/hooks/use-toast";
import { useBreadcrumb, useBreadcrumbStore } from "@/hooks/use-breadcrumb";
import { VisitForm } from "./visit-form";
import { hasPermission } from "@/hooks/use-role";
import { ClientSchema } from "@/utils/zod-schema/client";
import { formatZodErrors } from "@/utils/func/zodUtils";

// Define default client value outside component to avoid recreating on each render
const DEFAULT_CLIENT: ClientType = {
  _id: "",
  firstName: "",
  lastName: "",
  occupation: "",
  email: "",
  phoneNo: "",
  altNo: "",
  address: "",
  note: "",
  project: "",
  requirement: "",
  budget: 0,
  visits: [],
};

export const ClientUpdateSchema = ClientSchema.omit({ visitData: true });

const ClientDetails = () => {
  // Hooks
  const { useClientDetails, deleteClientMutation, updateClientMutation } =
    useClients();
  const { selectedClientId } = useClientStore();
  const { toast } = useToast();
  const { id, pageno } = useParams<{ id: string; pageno: string }>();
  const pageNo = Number(pageno) || 1;
  const navigate = useNavigate();
  const clientId = id || selectedClientId;
  const { logout: handleLogout, combinedRole } = useAuth(true);
  const { setBreadcrumbs } = useBreadcrumb();
  const { breadcrumbItems } = useBreadcrumbStore();
  const dialog = useAlertDialog({
    alertType: "Info",
    iconName: "Star",
    title: "Action Required",
    description: "Are you sure?",
    actionLabel: "Confirm",
    cancelLabel: "Cancel",
  });

  const { data, isLoading, error } = useClientDetails(clientId!);

  // Permissions
  const Permissions = {
    deleteClient: hasPermission(combinedRole, "Clients", "delete-client"),
    updateClient: hasPermission(combinedRole, "Clients", "update-client"),
    createVisit: hasPermission(combinedRole, "Clients", "create-visits"),
    showContactInfo: hasPermission(
      combinedRole,
      "Clients",
      "view-contact-info",
    ),
  };

  // State
  const [isVisitFormOpen, setIsVisitFormOpen] = useState<boolean>(false);
  const [client, setClient] = useState<ClientType>(DEFAULT_CLIENT);
  const [editableClient, setEditableClient] =
    useState<ClientType>(DEFAULT_CLIENT);
  const [isEditable, setIsEditable] = useState<boolean>(false);

  // Set up client data when loaded from API
  useEffect(() => {
    if (data) {
      setClient(data);
      setEditableClient(data);
    }
  }, [data]);

  // Set up breadcrumbs on mount
  useEffect(() => {
    if (breadcrumbItems) setBreadcrumbs(breadcrumbItems);
    else
      setBreadcrumbs([
        { label: "Client List", to: `/panel/clients/${pageNo}` },
        { label: `${client.firstName} ${client.lastName}` },
      ]);
  }, [
    setBreadcrumbs,
    breadcrumbItems,
    pageNo,
    client.firstName,
    client.lastName,
  ]);

  // Detect if there are changes to the client data
  const hasChanges = useMemo(() => {
    return JSON.stringify(client) !== JSON.stringify(editableClient);
  }, [client, editableClient]);

  // Functions
  const handleInputChange = useCallback(
    (field: keyof ClientType, value: string | number | Date) => {
      setEditableClient((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setEditableClient({ ...client });
    setIsEditable(false);
  }, [client]);

  const handleDelete = useCallback(() => {
    dialog.show({
      config: {
        iconName: "Trash2",
        alertType: "Danger",
        title: "Delete Client",
        description: `Are you sure you want to delete client ${client.firstName}?`,
        actionLabel: "Delete",
      },
      onAction: async () => {
        try {
          await deleteClientMutation.mutateAsync(clientId!);
          toast({
            title: "Success",
            description: "Client deleted successfully",
          });
          navigate(`/panel/clients/1`);
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error",
            description: err.response?.data.error || "Failed to delete client",
            variant: "destructive",
          });
        }
      },
    });
  }, [
    dialog,
    client.firstName,
    deleteClientMutation,
    clientId,
    toast,
    navigate,
  ]);

  const handleSave = useCallback(() => {
    dialog.show({
      config: {
        iconName: "CircleFadingArrowUp",
        alertType: "Warn",
        title: "Update Client",
        description: `Are you sure you want to update client ${editableClient.firstName}?`,
        actionLabel: "Update",
      },
      onAction: async () => {
        try {
          // Extract client data excluding _id and visits
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, visits, ...clientData } = editableClient;

          const validation = ClientUpdateSchema.safeParse(clientData);

          if (!validation.success) {
            const errorMessages = formatZodErrors(validation.error.errors);

            toast({
              title: "Form Validation Error",
              description: `Please correct the following errors:\n${errorMessages}`,
              variant: "warning",
            });
            return;
          }

          // Call the update mutation
          await updateClientMutation.mutateAsync({
            id: clientId!,
            ...clientData,
          });

          // Update original client with new data
          setClient(editableClient);
          setIsEditable(false);

          toast({
            title: "Success",
            description: "Client updated successfully",
            variant: "success",
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error",
            description: err.response?.data.error || "Failed to update client",
            variant: "destructive",
          });
        }
      },
      onCancel: () => {
        handleCancel();
      },
    });
  }, [
    dialog,
    editableClient,
    updateClientMutation,
    handleCancel,
    clientId,
    toast,
  ]);

  const handleEditToggle = useCallback(() => {
    if (isEditable) {
      // If in edit mode
      if (hasChanges) {
        // If there are changes, show confirmation dialog
        handleSave();
      } else {
        setIsEditable(false);
      }
    } else {
      // Enter edit mode
      setEditableClient({ ...client });
      setIsEditable(true);
    }
  }, [isEditable, hasChanges, client, handleSave]);

  // Error handling
  if (!clientId || error) {
    const { response, message } = (error as CustomAxiosError) || {};
    let errMsg = response?.data.error ?? message;

    if (errMsg === "Access denied. No token provided") {
      errMsg = "Access denied. No token provided please login again";
    } else if (errMsg === "Network Error") {
      errMsg =
        "Connection issue detected. Please check your internet or try again later.";
    }

    return (
      <CenterWrapper className="px-2 gap-2 text-center">
        <ErrorCard
          title="Error occurred"
          description={errMsg || "An unknown error occurred"}
          btnTitle="Go to Login"
          onAction={handleLogout}
        />
      </CenterWrapper>
    );
  }

  if (isLoading) {
    return (
      <CenterWrapper>
        <Loader />
      </CenterWrapper>
    );
  }

  return (
    //Added custom media query instead of sm: bcoz the visit table was overflowing between 740-640px
    <Card className="w-[90svw] [@media(min-width:740px)]:w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">
          {client.firstName} {client.lastName}
        </CardTitle>
        <CardDescription>Client details and visit information</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Client Information Section */}
          <ClientInfo
            isEditable={isEditable}
            client={isEditable ? editableClient : client}
            handleInputChange={handleInputChange}
            showContactInfo={Permissions.showContactInfo}
          />

          {/* Visit Information Section */}
          <VisitInfo client={client} />

          <div id="controls" className="flex justify-end gap-2 pt-4">
            {Permissions.deleteClient && (
              <Tooltip content="Delete Client">
                <Button
                  onClick={handleDelete}
                  size="icon"
                  variant="destructive"
                  disabled={isEditable} // Disable delete while editing
                >
                  <Trash2 />
                </Button>
              </Tooltip>
            )}

            {Permissions.updateClient && (
              <Tooltip content={isEditable ? "Save Client" : "Edit Client"}>
                <Button
                  onClick={handleEditToggle}
                  className={`text-white ${
                    isEditable
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-blue-700 hover:bg-blue-600"
                  }`}
                  size="icon"
                >
                  {isEditable ? <Save /> : <SquarePen />}
                </Button>
              </Tooltip>
            )}

            {Permissions.createVisit && (
              <Tooltip content="Add Visit">
                <Button
                  size="icon"
                  className="text-white bg-yellow-600 hover:bg-yellow-500"
                  onClick={() => setIsVisitFormOpen(true)}
                  disabled={isEditable} // Disable adding visits while editing
                >
                  <BookmarkPlus />
                </Button>
              </Tooltip>
            )}
          </div>

          <dialog.AlertDialog />
          <VisitForm
            isOpen={isVisitFormOpen}
            onOpenChange={setIsVisitFormOpen}
            mode="add"
            clientId={client._id}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
