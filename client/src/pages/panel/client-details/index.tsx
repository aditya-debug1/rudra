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
import { ClientType, VisitType } from "@/store/client";
import { BookmarkPlus, Save, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { VisitInfo } from "./visit-info";

interface ClientData extends Omit<ClientType, "_id" | "visits"> {
  visitData: Omit<VisitType, "client" | "_id">;
}

const ClientDetails = () => {
  const defaultClient: ClientData = {
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
    visitData: {
      date: new Date(),
      reference: "",
      source: "",
      relation: "",
      closing: "",
      status: null,
      remarks: [],
    },
  };
  const [client, setClient] = useState<ClientData>(defaultClient);
  const [isEditable, setIsEditable] = useState<boolean>(false);

  function toggleEditMode() {
    setIsEditable(!isEditable);
  }

  // Define a type that represents all possible field paths including nested ones
  type ClientFieldPath =
    | keyof ClientData
    | `visitData.${keyof Omit<VisitType, "client">}`;

  function handleInputChange(
    field: ClientFieldPath,
    value: string | number | Date,
  ) {
    if (field.includes(".")) {
      // Handle nested property
      const [parent, child] = field.split(".");

      if (parent === "visitData") {
        setClient({
          ...client,
          visitData: {
            ...client.visitData,
            [child]: value,
          } as Omit<VisitType, "client">,
        });
      }
    } else {
      // Handle top-level property (type assertion needed here)
      setClient({
        ...client,
        [field as keyof ClientData]: value,
      });
    }
  }

  return (
    <Card className="w-[90svw] sm:w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Client Details</CardTitle>
        <CardDescription>
          details of client and visit informations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Client Information Section */}
          <ClientInfo
            isEditable={isEditable}
            client={client}
            handleInputChange={handleInputChange}
          />

          {/* Visit Information Section */}
          <VisitInfo client={client} />

          <div id="controls" className="flex justify-end gap-2 pt-4">
            <Tooltip content="Delete Client">
              <Button size="icon" variant="destructive">
                <Trash2 />
              </Button>
            </Tooltip>

            <Tooltip content={isEditable ? "Save Client" : "Edit Client"}>
              <Button
                onClick={toggleEditMode}
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

            <Tooltip content="Add Visit">
              <Button
                size="icon"
                className="text-white bg-yellow-600 hover:bg-yellow-500"
              >
                <BookmarkPlus />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
