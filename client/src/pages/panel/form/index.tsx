import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { Briefcase, ReceiptText, User } from "lucide-react";
import { useEffect } from "react";
import ClientForm from "./client-form";

const Form = () => {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Form",
      },
    ]);
  }, [setBreadcrumbs]);

  return (
    <div className="w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className=" border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <ReceiptText className="w-6 h-6 text-primary" />
            Registration Forms
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 w-full">
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid max-w-[500px] w-full grid-cols-2 mx-auto mb-6">
              <TabsTrigger value="client">
                <User className="w-4 h-4 mr-2" /> Client
              </TabsTrigger>
              <TabsTrigger value="client-partner">
                <Briefcase className="w-4 h-4 mr-2" /> Client Partner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <ClientForm />
            </TabsContent>

            <TabsContent value="client-partner">Client Partner</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
