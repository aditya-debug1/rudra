import { DatePicker } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import { BankDetailsType } from "@/store/bank";
import { useBookingLedger } from "@/store/booking-ledger/query";
import {
  ClientBookingReference,
  CreateBookingLedgerPayload,
  PaymentMethod,
  PaymentType,
} from "@/store/booking-ledger/types";
import { capitalizeWords } from "@/utils/func/strUtils";
import { formatZodMessagesOnly } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { CreatePaymentSchema } from "@/utils/zod-schema/booking-ledger";
import {
  AlertCircle,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

// Types and Constants
type AmountUnit = "rupees" | "thousand" | "lakh" | "crore";

interface ValidationErrors {
  [key: string]: string;
}

interface AmountFieldState {
  displayValue: string;
  unit: AmountUnit;
}

const unitMultipliers = {
  rupees: 1,
  thousand: 1000,
  lakh: 100000,
  crore: 10000000,
};

const getPaymentTypeVariant = (type: PaymentType) => {
  switch (type) {
    case PaymentType.SCHEDULE_PAYMENT:
      return "default";
    case PaymentType.ADVANCE:
      return "info";
    case PaymentType.PENALTY:
      return "urgent";
    case PaymentType.ADJUSTMENT:
      return "warning";
    case PaymentType.REFUND:
      return "destructive";
    default:
      return "secondary";
  }
};

// Utility Functions
const calculateActualAmount = (
  displayValue: string,
  unit: AmountUnit,
): number => {
  const numericValue = parseFloat(displayValue) || 0;
  return numericValue * unitMultipliers[unit];
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

// Component Props
interface CreatePaymentFormProps {
  clientBooking: ClientBookingReference;
  bankAccounts: BankDetailsType[];
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
}

// Custom Hooks
const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const clearFieldError = (field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setFieldError = (field: string, message: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const clearAllErrors = () => {
    setValidationErrors({});
  };

  return {
    validationErrors,
    setValidationErrors,
    clearFieldError,
    setFieldError,
    clearAllErrors,
  };
};

const useAmountFields = () => {
  const [amountField, setAmountField] = useState<AmountFieldState>({
    displayValue: "",
    unit: "thousand",
  });

  const [demandField, setDemandField] = useState<AmountFieldState>({
    displayValue: "",
    unit: "thousand",
  });

  const updateAmountDisplay = (value: string) => {
    setAmountField((prev) => ({ ...prev, displayValue: value }));
  };

  const updateAmountUnit = (unit: AmountUnit) => {
    setAmountField((prev) => ({ ...prev, unit }));
  };

  const updateDemandDisplay = (value: string) => {
    setDemandField((prev) => ({ ...prev, displayValue: value }));
  };

  const updateDemandUnit = (unit: AmountUnit) => {
    setDemandField((prev) => ({ ...prev, unit }));
  };

  const getCalculatedAmount = () =>
    calculateActualAmount(amountField.displayValue, amountField.unit);
  const getCalculatedDemand = () =>
    calculateActualAmount(demandField.displayValue, demandField.unit);

  const resetAmountFields = () => {
    setAmountField({ displayValue: "", unit: "thousand" });
    setDemandField({ displayValue: "", unit: "thousand" });
  };

  return {
    amountField,
    demandField,
    updateAmountDisplay,
    updateAmountUnit,
    updateDemandDisplay,
    updateDemandUnit,
    getCalculatedAmount,
    getCalculatedDemand,
    resetAmountFields,
  };
};

// Sub-components
interface AmountInputProps {
  label: string;
  value: string;
  unit: AmountUnit;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: AmountUnit) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  error,
  required = false,
  disabled = false,
  placeholder = "Enter amount",
}) => {
  return (
    <div className="space-y-1">
      <FormFieldWrapper
        Important={required}
        ImportantSide="right"
        LabelText={label}
        className="gap-2"
      >
        <div className="flex gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            min="0"
            step="0.01"
            className={error ? "border-red-500" : ""}
          />
          <Select
            value={unit}
            onValueChange={(value) => onUnitChange(value as AmountUnit)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="rupees">₹</SelectItem>
                <SelectItem value="thousand">K</SelectItem>
                <SelectItem value="lakh">Lakh</SelectItem>
                <SelectItem value="crore">Cr</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </FormFieldWrapper>
    </div>
  );
};

interface PaymentSummaryProps {
  currentAmount: number;
  demandAmount: number;
  show: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  currentAmount,
  demandAmount,
  show,
}) => {
  const balanceInfo = useMemo(() => {
    const remainingBalance = demandAmount - currentAmount;
    return {
      remainingBalance,
      isOverpayment: remainingBalance < 0,
    };
  }, [demandAmount, currentAmount]);

  if (!show) return null;

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current Payment</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(currentAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Demand Amount</p>
            <p className="font-semibold">{formatCurrency(demandAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p
              className={`font-semibold ${
                balanceInfo.isOverpayment ? "text-orange-600" : "text-blue-600"
              }`}
            >
              {formatCurrency(Math.abs(balanceInfo.remainingBalance))}
              {balanceInfo.isOverpayment && " (Excess)"}
            </p>
          </div>
        </div>

        {balanceInfo.isOverpayment && (
          <Alert className="mt-3 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              This payment exceeds the remaining balance by{" "}
              {formatCurrency(Math.abs(balanceInfo.remainingBalance))}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

interface PaymentMethodFieldsProps {
  method: PaymentMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentDetails: any;
  onDetailsChange: (field: string, value: string | Date) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
}

const PaymentMethodFields: React.FC<PaymentMethodFieldsProps> = ({
  method,
  paymentDetails,
  onDetailsChange,
  validationErrors,
  isSubmitting,
}) => {
  const commonFieldClass = "space-y-1";

  const renderField = (
    field: string,
    label: string,
    required: boolean = false,
    type: "text" | "date" = "text",
    placeholder?: string,
  ) => {
    const errorKey = `paymentDetails.${field}`;

    if (type === "date") {
      return (
        <div className={commonFieldClass}>
          <FormFieldWrapper
            Important={required}
            ImportantSide="right"
            LabelText={label}
            className="gap-2"
          >
            <DatePicker
              disabled={isSubmitting}
              defaultDate={
                paymentDetails[field]
                  ? new Date(paymentDetails[field])
                  : undefined
              }
              onDateChange={(date) => onDetailsChange(field, date)}
              className="w-full"
            />
            {validationErrors[errorKey] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors[errorKey]}
              </p>
            )}
          </FormFieldWrapper>
        </div>
      );
    }

    return (
      <div className={commonFieldClass}>
        <FormFieldWrapper
          Important={required}
          ImportantSide="right"
          LabelText={label}
          className="gap-2"
        >
          <Input
            value={paymentDetails[field] || ""}
            onChange={(e) => onDetailsChange(field, e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={isSubmitting}
            className={validationErrors[errorKey] ? "border-red-500" : ""}
          />
          {validationErrors[errorKey] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors[errorKey]}
            </p>
          )}
        </FormFieldWrapper>
      </div>
    );
  };

  switch (method) {
    case PaymentMethod.CHEQUE:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField("chequeNumber", "Cheque Number", true)}
          {renderField("bankName", "Bank Name")}
          {renderField("chequeDate", "Cheque Date", true, "date")}
          {renderField("dueDate", "Due Date", false, "date")}
        </div>
      );

    case PaymentMethod.UPI:
    case PaymentMethod.ONLINE_PAYMENT:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField("transactionId", "Transaction ID", true)}
          {renderField("transactionDate", "Transaction Date", false, "date")}
        </div>
      );

    case PaymentMethod.NEFT:
    case PaymentMethod.RTGS:
    case PaymentMethod.IMPS:
    case PaymentMethod.BANK_TRANSFER:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField("referenceNumber", "Reference Number", true)}
          {renderField("bankName", "Bank Name")}
          <div className="md:col-span-2">
            {renderField("transactionDate", "Transaction Date", false, "date")}
          </div>
        </div>
      );

    case PaymentMethod.DEMAND_DRAFT:
      return renderField("bankName", "Bank Name");

    default:
      return null;
  }
};

// Main Component
export const CreatePaymentForm = ({
  clientBooking,
  bankAccounts,
  isOpen,
  onOpenChange,
}: CreatePaymentFormProps) => {
  const { user } = useAuth(true);
  const { createPaymentMutation } = useBookingLedger();

  // Hooks
  const {
    validationErrors,
    setValidationErrors,
    clearFieldError,
    clearAllErrors,
  } = useFormValidation();

  const {
    amountField,
    demandField,
    updateAmountDisplay,
    updateAmountUnit,
    updateDemandDisplay,
    updateDemandUnit,
    getCalculatedAmount,
    getCalculatedDemand,
    resetAmountFields,
  } = useAmountFields();

  // State
  const [formData, setFormData] = useState<CreateBookingLedgerPayload>({
    clientId: clientBooking._id,
    date: new Date(),
    amount: 0,
    demand: 0,
    description: "",
    type: PaymentType.SCHEDULE_PAYMENT,
    method: PaymentMethod.CHEQUE,
    paymentDetails: {},
    toAccount: "",
    createdBy: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const paymentMethods = Object.values(PaymentMethod);
  const paymentTypes = Object.values(PaymentType);

  // Computed values
  const calculatedAmount = getCalculatedAmount();
  const calculatedDemand = getCalculatedDemand();
  const showSummary = calculatedAmount > 0 || calculatedDemand > 0;

  // Event Handlers
  const handleInputChange = (
    field: keyof CreateBookingLedgerPayload,
    value: string | number | Date | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      clearFieldError(field);
    }
  };

  const handlePaymentDetailsChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [field]: value,
      },
    }));

    const errorKey = `paymentDetails.${field}`;
    if (validationErrors[errorKey]) {
      clearFieldError(errorKey);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: clientBooking._id,
      date: new Date(),
      amount: 0,
      demand: 0,
      description: "",
      type: PaymentType.SCHEDULE_PAYMENT,
      method: PaymentMethod.CHEQUE,
      paymentDetails: {},
      toAccount: "",
      createdBy: "",
    });
    resetAmountFields();
    clearAllErrors();
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!calculatedAmount || calculatedAmount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.toAccount) {
      errors.toAccount = "Please select a bank account";
    }

    // Payment method specific validations
    if (formData.method === PaymentMethod.CHEQUE) {
      if (!formData.paymentDetails.chequeNumber?.trim()) {
        errors["paymentDetails.chequeNumber"] = "Cheque number is required";
      }
      if (!formData.paymentDetails.chequeDate) {
        errors["paymentDetails.chequeDate"] = "Cheque date is required";
      }
    }

    if (
      [PaymentMethod.UPI, PaymentMethod.ONLINE_PAYMENT].includes(
        formData.method,
      )
    ) {
      if (!formData.paymentDetails.transactionId?.trim()) {
        errors["paymentDetails.transactionId"] = "Transaction ID is required";
      }
    }

    if (
      [
        PaymentMethod.NEFT,
        PaymentMethod.RTGS,
        PaymentMethod.IMPS,
        PaymentMethod.BANK_TRANSFER,
      ].includes(formData.method)
    ) {
      if (!formData.paymentDetails.referenceNumber?.trim()) {
        errors["paymentDetails.referenceNumber"] =
          "Reference number is required";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Calculate actual amounts at submission time
    const finalAmount = getCalculatedAmount();
    const finalDemand = getCalculatedDemand();

    // Update form data with calculated amounts
    const updatedFormData = {
      ...formData,
      amount: finalAmount,
      demand: finalDemand,
    };

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const schemaPayload = {
        ...updatedFormData,
        type: updatedFormData.type.toLowerCase().replace("_", "-"),
        method: updatedFormData.method.toLowerCase().replace("_", "-"),
        createdBy: user.username,
      };

      const schemaValidation = CreatePaymentSchema.safeParse(schemaPayload);
      if (!schemaValidation.success) {
        const errorMessages = formatZodMessagesOnly(
          schemaValidation.error.errors,
        );
        toast({
          title: "Form Validation Error",
          description: `Please correct the following errors:\n${errorMessages}`,
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      await createPaymentMutation.mutateAsync({
        ...updatedFormData,
        createdBy: user.username,
      });

      toast({
        title: "Payment Created Successfully",
        description: `Payment of ${formatCurrency(finalAmount)} has been recorded.`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create payment:", error);
      const err = error as CustomAxiosError;
      toast({
        title: "Creation Failed",
        description:
          err.response?.data.error ||
          "An unknown error occurred while creating the payment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] w-[90vw] sm:w-[80vw] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg hidden sm:block">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="w-full">
              <DialogTitle className="text-xl w-full font-semibold flex text-center justify-center sm:justify-start flex-col sm:flex-row items-center gap-2">
                Create Payment
                <Badge
                  variant={getPaymentTypeVariant(formData.type)}
                  className="text-xs"
                >
                  {capitalizeWords(formData.type.replace("-", " "))}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground items-center gap-2 mt-1 hidden sm:flex">
                <User className="h-4 w-4" />
                <span className="font-medium">{clientBooking.applicant}</span>
                <span>•</span>
                <Building className="h-4 w-4" />
                <span>
                  {clientBooking.project} ({clientBooking.unit})
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-220px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Payment Summary Card */}
            <PaymentSummary
              currentAmount={calculatedAmount}
              demandAmount={calculatedDemand}
              show={showSummary}
            />

            {/* Basic Payment Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <FormFieldWrapper
                      Important
                      ImportantSide="right"
                      LabelText="Payment Date"
                      className="gap-2"
                    >
                      <DatePicker
                        disabled={isSubmitting}
                        defaultDate={
                          formData.date ? new Date(formData.date) : new Date()
                        }
                        onDateChange={(date) => handleInputChange("date", date)}
                        className="w-full"
                      />
                    </FormFieldWrapper>
                  </div>

                  <div className="space-y-1">
                    <FormFieldWrapper
                      Important
                      ImportantSide="right"
                      LabelText="Payment Type"
                      className="gap-2"
                    >
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleInputChange("type", value as PaymentType)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {paymentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {capitalizeWords(type.replace("_", " "))}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormFieldWrapper>
                  </div>

                  <div className="space-y-1">
                    <FormFieldWrapper
                      Important
                      ImportantSide="right"
                      LabelText="Payment Method"
                      className="gap-2"
                    >
                      <Select
                        value={formData.method}
                        onValueChange={(value) => {
                          handleInputChange("method", value as PaymentMethod);
                          setFormData((prev) => ({
                            ...prev,
                            paymentDetails: {},
                          }));
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {capitalizeWords(method.replace("_", " "))}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormFieldWrapper>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AmountInput
                    label="Amount"
                    value={amountField.displayValue}
                    unit={amountField.unit}
                    onValueChange={updateAmountDisplay}
                    onUnitChange={updateAmountUnit}
                    error={validationErrors.amount}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter amount"
                  />

                  <AmountInput
                    label="Demand"
                    value={demandField.displayValue}
                    unit={demandField.unit}
                    onValueChange={updateDemandDisplay}
                    onUnitChange={updateDemandUnit}
                    disabled={isSubmitting}
                    placeholder="Enter demand"
                  />
                </div>

                <div className="space-y-1">
                  <FormFieldWrapper
                    Important
                    ImportantSide="right"
                    LabelText="Description"
                    className="gap-2"
                  >
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter payment description"
                      disabled={isSubmitting}
                      rows={3}
                      maxLength={500}
                      className={
                        validationErrors.description ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 characters
                    </p>
                  </FormFieldWrapper>
                </div>

                <div className="space-y-1">
                  <FormFieldWrapper
                    Important
                    ImportantSide="right"
                    LabelText="To Account"
                    className="gap-2"
                  >
                    <Select
                      value={formData.toAccount}
                      onValueChange={(value) =>
                        handleInputChange("toAccount", value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={
                          validationErrors.toAccount ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select bank account">
                          {formData.toAccount &&
                            (() => {
                              const selectedAccount = bankAccounts.find(
                                (acc) => acc._id === formData.toAccount,
                              );
                              return selectedAccount ? (
                                <>
                                  <span className="truncate sm:hidden">
                                    {selectedAccount.name} - ***
                                    {selectedAccount.accountNumber.slice(-4)}
                                  </span>
                                  <span className="hidden sm:flex truncate">
                                    {selectedAccount.name} -{" "}
                                    {selectedAccount.holderName}(
                                    {selectedAccount.accountNumber})
                                  </span>
                                </>
                              ) : null;
                            })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              <div className="flex flex-col w-full">
                                <span className="font-medium text-left">
                                  {account.name}
                                </span>
                                <span className="text-sm text-muted-foreground text-left">
                                  {account.holderName} - {account.accountNumber}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {validationErrors.toAccount && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.toAccount}
                      </p>
                    )}
                  </FormFieldWrapper>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Specific Fields */}
            {formData.method && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">
                    {capitalizeWords(formData.method.replace("_", " "))} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodFields
                    method={formData.method}
                    paymentDetails={formData.paymentDetails}
                    onDetailsChange={handlePaymentDetailsChange}
                    validationErrors={validationErrors}
                    isSubmitting={isSubmitting}
                  />
                </CardContent>
              </Card>
            )}

            {/* Optional Fields */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-muted-foreground">
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldWrapper LabelText="From Account" className="gap-2">
                    <Input
                      value={formData.fromAccount || ""}
                      onChange={(e) =>
                        handleInputChange("fromAccount", e.target.value)
                      }
                      placeholder="Enter from account (optional)"
                      disabled={isSubmitting}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    LabelText="Stage Percentage"
                    className="gap-2"
                  >
                    <Input
                      type="number"
                      value={formData.stagePercentage || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "stagePercentage",
                          parseFloat(e.target.value) || undefined,
                        )
                      }
                      placeholder="Enter stage percentage (0-100)"
                      disabled={isSubmitting}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </FormFieldWrapper>
                </div>

                <FormFieldWrapper LabelText="Notes" className="gap-2">
                  <Textarea
                    value={formData.paymentDetails.notes || ""}
                    onChange={(e) =>
                      handlePaymentDetailsChange("notes", e.target.value)
                    }
                    placeholder="Enter additional notes (optional)"
                    disabled={isSubmitting}
                    rows={2}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.paymentDetails.notes?.length || 0}/500 characters
                  </p>
                </FormFieldWrapper>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="px-6 py-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            {calculatedAmount > 0 && (
              <>
                <DollarSign className="h-4 w-4" />
                <span>
                  Total:{" "}
                  <span className="font-semibold">
                    {formatCurrency(calculatedAmount)}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || calculatedAmount <= 0}
              className="flex-1 sm:flex-none min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="hidden sm:block h-4 w-4" />
                  Create Payment
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
