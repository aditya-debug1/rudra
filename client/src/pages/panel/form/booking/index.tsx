import { Combobox } from "@/components/custom ui/combobox";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TicketCheck } from "lucide-react";
import { useState } from "react";
import {
  BookingSchema,
  BookingType,
  ChargesNoteList,
  ProjectList,
} from "./utils";
import { Button } from "@/components/ui/button";
import { budgetOptions } from "@/store/data/options";
import { MultiSelect } from "@/components/custom ui/multi-select";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { useToast } from "@/hooks/use-toast";
import { formatZodErrors } from "@/utils/func/zodUtils";
import { BookingForm as PDFBookingForm } from "./booking-pdf"; // Make sure this import matches your PDF component path
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const BankList = [
  "SBI",
  "CANARA",
  "PNB",
  "HDFC",
  "AXIS",
  "ICICI",
  "IIFL",
  "INDIABULLS",
  "AAVAS",
  "SUNDARAM",
  "OTHERS",
];

export const BookingForm = () => {
  const { toast } = useToast();
  const [amountUnit, setAmountUnit] = useState<number>(100000);
  const [bookingUnit, setBookingUnit] = useState<number>(1000);
  const [charges, setCharges] = useState<string>("");
  const [finalizedBooking, setFinalizedBooking] = useState<BookingType | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingType>({
    project: {
      name: "",
      by: "",
      address: "",
    },
    unit: {
      wing: "",
      floor: "",
      flatNo: "",
      configuration: "",
    },
    payment: {
      amount: 0,
      includedChargesNote: "",
      paymentTerms: "",
      banks: [],
    },
    applicants: {
      primary: "",
      coApplicant: "",
      contact: {
        residenceNo: "",
        email: "",
        phoneNo: "",
        address: "",
      },
    },
    bookingDetails: {
      date: new Date(),
      bookingAmt: 0,
      checkNo: "",
      bankName: "",
      paymentDate: new Date(),
    },
  });

  const projectOptions = ProjectList.map((project) => {
    return { label: project.name, value: project.name };
  });

  const chargesOptions = ChargesNoteList.map((charge) => {
    return { label: charge, value: charge };
  });

  const bankOptions = BankList.map((bank) => {
    return { label: bank, value: bank };
  });

  // Event Handlers
  function handleInputChange(
    path: string[],
    value: string[] | string | number | Date,
  ) {
    setBookingData((prev) => {
      const updated = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = updated;

      // Traverse until the second last key
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;

      return updated;
    });
  }

  function handleAmountChange(unit: string) {
    setAmountUnit(Number(unit));
  }

  function handleBookingAmountChange(unit: string) {
    setBookingUnit(Number(unit));
  }

  function handleProjectChange(projectName: string) {
    const project = ProjectList.find((p) => p.name === projectName);

    if (!project) return;

    setBookingData((prev) => ({
      ...prev,
      project: project,
    }));
  }

  function handleChargesNoteChange(value: string) {
    if (value !== "Other") {
      setBookingData((prev) => ({
        ...prev,
        payment: {
          amount: bookingData.payment.amount,
          banks: bookingData.payment.banks,
          paymentTerms: bookingData.payment.paymentTerms,
          includedChargesNote: value,
        },
      }));
    } else handleInputChange(["payment", "includedChargesNote"], "");
    setCharges(value);
  }

  function handleSubmit() {
    const newBooking: BookingType = {
      ...bookingData,
      payment: {
        ...bookingData.payment,
        amount: bookingData.payment.amount * amountUnit,
      },
      bookingDetails: {
        ...bookingData.bookingDetails,
        bookingAmt: bookingData.bookingDetails.bookingAmt * bookingUnit,
      },
    };

    const validation = BookingSchema.safeParse(newBooking);

    if (!validation.success) {
      if (validation.error.errors.length > 1) {
        toast({
          title: "Form Validation Error",
          description: `Please fill all the required fields before submission`,
          variant: "warning",
        });
        return;
      }

      const errorMessages = formatZodErrors(validation.error.errors);

      toast({
        title: "Form Validation Error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    // Save the finalized booking data for PDF rendering
    setFinalizedBooking(newBooking);
    setIsPreviewOpen(true);

    toast({
      title: "Success",
      description: "Form validated successfully. PDF preview is ready.",
      variant: "success",
    });
  }

  return (
    <>
      <Card className="w-full mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TicketCheck className="h-5 w-5" />
            Booking Form
          </CardTitle>
          <CardDescription>
            Enter applicant details and other informations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">General Information</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-6">
                  <FormFieldWrapper
                    className="gap-3"
                    LabelText="Project Name"
                    Important
                    ImportantSide="right"
                  >
                    <Combobox
                      value={bookingData.project.name}
                      onChange={handleProjectChange}
                      options={projectOptions}
                      width="w-full"
                    />
                  </FormFieldWrapper>
                  <div className="flex flex-col sm:flex-row gap-1 grow">
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Applicant"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.applicants.primary}
                        placeholder="e.g. John Doe"
                        onChange={(e) =>
                          handleInputChange(
                            ["applicants", "primary"],
                            e.target.value,
                          )
                        }
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Co-Applicant"
                    >
                      <Input
                        value={bookingData.applicants.coApplicant}
                        placeholder="e.g. Jane Doe"
                        onChange={(e) =>
                          handleInputChange(
                            ["applicants", "coApplicant"],
                            e.target.value,
                          )
                        }
                      />
                    </FormFieldWrapper>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormFieldWrapper
                    className="gap-3"
                    LabelText="Phone Number"
                    Important
                    ImportantSide="right"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 grow">
                      <Input
                        className="w-full"
                        value={bookingData.applicants.contact.phoneNo}
                        placeholder="Primary No"
                        onChange={(e) =>
                          handleInputChange(
                            ["applicants", "contact", "phoneNo"],
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        className="w-full"
                        value={bookingData.applicants.contact.residenceNo}
                        placeholder="Residence (Optional)"
                        onChange={(e) =>
                          handleInputChange(
                            ["applicants", "contact", "residenceNo"],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </FormFieldWrapper>
                  <FormFieldWrapper className="gap-3" LabelText="Email">
                    <Input
                      value={bookingData.applicants.contact.email}
                      placeholder="john.doe@example.com"
                      onChange={(e) =>
                        handleInputChange(
                          ["applicants", "contact", "email"],
                          e.target.value,
                        )
                      }
                    />
                  </FormFieldWrapper>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-1 grow">
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Floor"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.unit.floor}
                        placeholder="Enter Floor"
                        onChange={(e) =>
                          handleInputChange(["unit", "floor"], e.target.value)
                        }
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Wing"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.unit.wing}
                        placeholder="Enter Wing"
                        onChange={(e) =>
                          handleInputChange(["unit", "wing"], e.target.value)
                        }
                      />
                    </FormFieldWrapper>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 grow">
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Flat No"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.unit.flatNo}
                        placeholder="Enter Flat No"
                        onChange={(e) =>
                          handleInputChange(["unit", "flatNo"], e.target.value)
                        }
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Configuration"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.unit.configuration}
                        placeholder="e.g. 2BHK"
                        onChange={(e) =>
                          handleInputChange(
                            ["unit", "configuration"],
                            e.target.value,
                          )
                        }
                      />
                    </FormFieldWrapper>
                  </div>
                </div>
              </div>

              <FormFieldWrapper
                className="gap-3"
                LabelText="Address"
                Important
                ImportantSide="right"
              >
                <Textarea
                  className="min-h-20"
                  placeholder="e.g. 123 Main Street, Anytown, State, 12345"
                  value={bookingData.applicants.contact.address}
                  onChange={(e) =>
                    handleInputChange(
                      ["applicants", "contact", "address"],
                      e.target.value,
                    )
                  }
                />
              </FormFieldWrapper>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-medium">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Amount"
                  Important
                  ImportantSide="right"
                >
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input
                      className="w-full"
                      type="number"
                      value={bookingData.payment.amount}
                      onChange={(e) =>
                        handleInputChange(
                          ["payment", "amount"],
                          Number(e.target.value),
                        )
                      }
                      placeholder="0"
                    />
                    <Select
                      value={amountUnit.toString()}
                      onValueChange={handleAmountChange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Budget Units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Units</SelectLabel>
                          {budgetOptions.map((unit, index) => {
                            return (
                              <SelectItem
                                value={unit.value.toString()}
                                key={index}
                              >
                                {unit.label}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </FormFieldWrapper>
                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Charges Note"
                  Important
                  ImportantSide="right"
                >
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Combobox
                      value={charges}
                      onChange={handleChargesNoteChange}
                      options={chargesOptions}
                      width="w-full"
                    />
                    {charges === "Other" && (
                      <Input
                        className="w-full mt-2 sm:mt-0"
                        value={bookingData.payment.includedChargesNote}
                        placeholder="Enter your charges note"
                        onChange={(e) =>
                          handleInputChange(
                            ["payment", "includedChargesNote"],
                            e.target.value,
                          )
                        }
                      />
                    )}
                  </div>
                </FormFieldWrapper>
                <FormFieldWrapper LabelText="Banks for loan" className="gap-3">
                  <MultiSelect
                    defaultValue={bookingData.payment.banks}
                    options={bankOptions}
                    onValueChange={(e) =>
                      handleInputChange(["payment", "banks"], e)
                    }
                    maxCount={2}
                  />
                </FormFieldWrapper>
              </div>
              <FormFieldWrapper
                className="gap-3"
                LabelText="Payment Terms"
                Important
                ImportantSide="right"
              >
                <Textarea
                  className="min-h-20"
                  placeholder="Enter payment terms here..."
                  value={bookingData.payment.paymentTerms}
                  onChange={(e) =>
                    handleInputChange(
                      ["payment", "paymentTerms"],
                      e.target.value,
                    )
                  }
                />
              </FormFieldWrapper>
            </div>
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-medium">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Booking Date"
                  Important
                  ImportantSide="right"
                >
                  <DatePickerV2
                    className="sm:w-full"
                    defaultDate={bookingData.bookingDetails.date}
                    onDateChange={(e) => {
                      handleInputChange(["bookingDetails", "date"], e);
                    }}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  className="gap-3 col-span-1"
                  LabelText="Booking Amount"
                  Important
                  ImportantSide="right"
                >
                  <div className="flex flex-row gap-2 w-full">
                    <Input
                      className="w-full"
                      type="number"
                      value={bookingData.bookingDetails.bookingAmt}
                      onChange={(e) =>
                        handleInputChange(
                          ["bookingDetails", "bookingAmt"],
                          Number(e.target.value),
                        )
                      }
                      placeholder="0"
                    />
                    <Select
                      value={bookingUnit.toString()}
                      onValueChange={handleBookingAmountChange}
                    >
                      <SelectTrigger className="w-32 shrink-0">
                        <SelectValue placeholder="Units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Units</SelectLabel>
                          {budgetOptions.map((unit, index) => {
                            return (
                              <SelectItem
                                value={unit.value.toString()}
                                key={index}
                              >
                                {unit.label}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </FormFieldWrapper>

                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Check/Draft No"
                  Important
                  ImportantSide="right"
                >
                  <Input
                    placeholder="e.g. 12334"
                    value={bookingData.bookingDetails.checkNo}
                    onChange={(e) => {
                      handleInputChange(
                        ["bookingDetails", "checkNo"],
                        e.target.value,
                      );
                    }}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Bank Name"
                  Important
                  ImportantSide="right"
                >
                  <Input
                    placeholder="e.g. SBI"
                    value={bookingData.bookingDetails.bankName}
                    onChange={(e) => {
                      handleInputChange(
                        ["bookingDetails", "bankName"],
                        e.target.value,
                      );
                    }}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  className="gap-3"
                  LabelText="Payment Date"
                  Important
                  ImportantSide="right"
                >
                  <DatePickerV2
                    className="sm:w-full"
                    defaultDate={bookingData.bookingDetails.paymentDate}
                    onDateChange={(e) => {
                      handleInputChange(["bookingDetails", "paymentDate"], e);
                    }}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end p-4 sm:p-6">
          <Button className="w-full sm:w-auto" onClick={handleSubmit}>
            Create Print
          </Button>
        </CardFooter>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Booking Form Preview</h2>
            {finalizedBooking && (
              <PDFDownloadLink
                document={<PDFBookingForm data={finalizedBooking} />}
                fileName={`booking-${finalizedBooking.applicants.primary}-${finalizedBooking.unit.flatNo}.pdf`}
                className="bg-primary text-secondary px-4 py-2 rounded-md hover:bg-primary/90"
              >
                {({ loading }) =>
                  loading ? "Preparing Download..." : "Download PDF"
                }
              </PDFDownloadLink>
            )}
          </div>
          <div className="flex-1 w-full overflow-auto border rounded-md">
            {finalizedBooking && (
              <PDFViewer width="100%" height="600px" className="border-0">
                <PDFBookingForm data={finalizedBooking} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
