import { Combobox } from "@/components/custom ui/combobox";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { MultiSelect } from "@/components/custom ui/multi-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { budgetOptions } from "@/store/data/options";
import { formatZodErrors } from "@/utils/func/zodUtils";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { TicketCheck } from "lucide-react";
import { useState } from "react";
import { BookingForm as PdfFlatBookingForm } from "./booking-pdf";
import {
  BookingSchema,
  BookingType,
  FlatChargesNoteList,
  ProjectList,
  ShopChargesNoteList,
} from "./utils";
import { toProperCase } from "@/utils/func/strUtils";

const BankList = [
  "SBI",
  "CANARA",
  "PNB",
  "HDFC",
  "BOB",
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
  const [formType, setFormType] = useState<"flat" | "shop">("flat");
  const [finalizedBooking, setFinalizedBooking] = useState<BookingType | null>(
    null,
  );
  const [bookingData, setBookingData] = useState<BookingType>({
    type: formType,
    project: {
      name: "",
      by: "",
      address: "",
    },
    unit: {
      floor: "",
      unitNo: "",
      configuration: "",
      ...(formType === "flat" ? { wing: "" } : { area: 0 }),
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

  const ChargesNoteList =
    bookingData.type == "flat" ? FlatChargesNoteList : ShopChargesNoteList;

  const projectOptions = ProjectList.map((project) => {
    return { label: project.name, value: project.name };
  });

  const chargesOptions = ChargesNoteList.map((charge) => {
    return { label: charge, value: charge };
  });

  const bankOptions = BankList.map((bank) => {
    return { label: bank, value: bank };
  });

  // Handle form type change (flat or shop)
  const handleFormTypeChange = (type: "flat" | "shop") => {
    setFormType(type);

    // Reset unit data and update structure based on type
    setBookingData((prev) => ({
      ...prev,
      type: type,
      unit: {
        floor: prev.unit.floor,
        unitNo: prev.unit.unitNo,
        configuration: prev.unit.configuration,
        ...(type === "flat" ? { wing: "" } : { area: 0 }),
      },
    }));
  };

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

  function handleManualValidation(d: BookingType) {
    if (!d.project.name.trim()) return false;
    if (
      !d.unit.unitNo.trim() ||
      !d.unit.floor.trim() ||
      !d.unit.configuration.trim()
    )
      return false;
    if (
      !d.applicants.primary.trim() ||
      !d.applicants.contact.address.trim() ||
      !d.applicants.contact.phoneNo.trim()
    )
      return false;
    if (
      !d.payment.paymentTerms.trim() ||
      !d.payment.includedChargesNote.trim() ||
      d.payment.amount <= 0
    )
      return false;
    if (
      !d.bookingDetails.date ||
      !d.bookingDetails.checkNo.trim() ||
      !d.bookingDetails.bankName.trim() ||
      d.bookingDetails.bookingAmt <= 0 ||
      !d.bookingDetails.paymentDate
    )
      return false;

    // Type-specific validation
    if (d.type === "flat" && (!d.unit.wing || !d.unit.wing.trim()))
      return false;
    if (d.type === "shop" && (!d.unit.area || d.unit.area <= 0)) return false;

    return true;
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

  async function openPdfInNewTab(bookingData: BookingType) {
    // Generate the PDF blob
    const blob = await pdf(<PdfFlatBookingForm data={bookingData} />).toBlob();

    // Create a URL for the blob
    const blobUrl = URL.createObjectURL(blob);

    // Open in a new tab
    window.open(blobUrl, "_blank");
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

    if (!handleManualValidation(newBooking)) {
      toast({
        title: "Form Validation Error",
        description: `Please fill all the fields`,
        variant: "warning",
      });
      return;
    }

    const validation = BookingSchema.safeParse(newBooking);

    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.error.errors);

      toast({
        title: "Form Validation Error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    console.log("Validation Passed");
    // Save the finalized booking data for download link
    setFinalizedBooking(newBooking);

    // Open the PDF in a new tab
    openPdfInNewTab(newBooking);

    toast({
      title: "Success",
      description: "Form validated successfully. PDF opened in new tab.",
      variant: "success",
    });
  }

  return (
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
          {/* Form Type Selection */}
          <div className="flex gap-4">
            <Button
              variant={formType === "flat" ? "default" : "outline"}
              onClick={() => handleFormTypeChange("flat")}
            >
              Flat
            </Button>
            <Button
              variant={formType === "shop" ? "default" : "outline"}
              onClick={() => handleFormTypeChange("shop")}
            >
              Shop
            </Button>
          </div>

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
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-1 grow">
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
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-1 grow">
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

                  {formType === "flat" ? (
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Wing"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        value={bookingData.unit.wing || ""}
                        placeholder="Enter Wing"
                        onChange={(e) =>
                          handleInputChange(["unit", "wing"], e.target.value)
                        }
                      />
                    </FormFieldWrapper>
                  ) : (
                    <FormFieldWrapper
                      className="gap-3 w-full"
                      LabelText="Area (sq.ft)"
                      Important
                      ImportantSide="right"
                    >
                      <Input
                        type="number"
                        value={bookingData.unit.area || 0}
                        placeholder="Enter Area"
                        onChange={(e) =>
                          handleInputChange(
                            ["unit", "area"],
                            Number(e.target.value),
                          )
                        }
                      />
                    </FormFieldWrapper>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-1 grow">
                  <FormFieldWrapper
                    className="gap-3 w-full"
                    LabelText={`${toProperCase(formType)} No`}
                    Important
                    ImportantSide="right"
                  >
                    <Input
                      value={bookingData.unit.unitNo}
                      placeholder={`Enter ${toProperCase(formType)} No`}
                      onChange={(e) =>
                        handleInputChange(["unit", "unitNo"], e.target.value)
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
                      placeholder={
                        formType === "flat" ? "e.g. 2BHK" : "e.g. Retail"
                      }
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
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${formType === "flat" ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-4`}
            >
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
              {formType === "flat" && (
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
              )}
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
                  handleInputChange(["payment", "paymentTerms"], e.target.value)
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
      <CardFooter className="justify-end p-4 sm:p-6 gap-4">
        {finalizedBooking && (
          <PDFDownloadLink
            document={<PdfFlatBookingForm data={finalizedBooking} />}
            fileName={`booking-${finalizedBooking.applicants.primary}-${finalizedBooking.unit.unitNo}.pdf`}
            className="bg-primary text-secondary px-4 py-2 rounded-md hover:bg-primary/90 w-full sm:w-auto"
          >
            {({ loading }) =>
              loading ? "Preparing Download..." : "Download PDF"
            }
          </PDFDownloadLink>
        )}

        <Button className="w-full sm:w-auto" onClick={handleSubmit}>
          Preview in New Tab
        </Button>
      </CardFooter>
    </Card>
  );
};
