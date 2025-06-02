import Sign from "@/assets/ManagerSign.png";
import CambriaBoldItalic from "@/fonts/cambria/Cambria Bold Italic.ttf";
import CambriaBold from "@/fonts/cambria/Cambria Bold.ttf";
import CambriaItalic from "@/fonts/cambria/Cambria Italic.ttf";
import CambriaRegular from "@/fonts/cambria/Cambria.ttf";
import { getOrdinal, numberToWords } from "@/utils/func/numberUtils";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Buffer } from "buffer";
import LetterHead from "./letterhead";

export interface DemandLetterDataType {
  applicationInfo: {
    date: Date;
    applicant: string;
    coApplicant?: string;
  };
  property: {
    project: {
      name: string;
      address: string;
    };
    unitDetails: {
      wing?: string;
      floorNo: number;
      unitNo: string;
    };
  };
  financials: {
    projectStage: number;
    agreementValue: string;
    amountReceived: number;
  };
  banking: {
    holderName: string;
    accountNo: string;
    ifscCode: string;
    bank: string;
    branch: string;
  };
}

interface DemandLetterProps {
  data: DemandLetterDataType;
  letterHeadData: { name: string; address: string; email: string };
  isSigned?: boolean;
  includeLetterHead?: boolean;
}

// Font registration
const registerFonts = () => {
  Font.register({
    family: "Cambria",
    fonts: [
      {
        src: CambriaRegular,
        fontWeight: "normal",
        fontStyle: "normal",
      },
      {
        src: CambriaBold,
        fontWeight: "bold",
        fontStyle: "normal",
      },
      {
        src: CambriaItalic,
        fontWeight: "normal",
        fontStyle: "italic",
      },
      {
        src: CambriaBoldItalic,
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
};

registerFonts();

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: "20 60",
    fontSize: 10,
    lineHeight: 1.2,
    fontFamily: "Cambria",
  },
  bold: {
    fontWeight: "bold",
  },
  letterhead: {
    textAlign: "center",
    marginTop: 75,
    marginBottom: 15,
    paddingBottom: 8,
    textDecoration: "underline",
  },
  letterheadTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    textAlign: "right",
    marginBottom: 15,
  },
  recipient: {
    marginBottom: 12,
  },
  recipientLabel: {
    marginBottom: 2,
  },
  recipientName: {
    marginBottom: 1,
  },
  greeting: {
    marginBottom: 10,
  },
  subject: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    margin: "10 0 3",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColHighlight: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#ffffcc",
  },
  tableCellHeader: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: "auto",
    marginTop: 4,
    marginBottom: 4,
    fontSize: 9,
    marginLeft: 6,
    marginRight: 6,
  },
  tableCellRight: {
    margin: "auto",
    marginTop: 4,
    marginBottom: 4,
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: 6,
    marginRight: 6,
    textAlign: "right",
  },
  tableCellBold: {
    margin: "auto",
    marginTop: 4,
    marginBottom: 4,
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: 6,
    marginRight: 6,
  },
  amountWords: {
    textAlign: "center",
    fontWeight: "bold",
    margin: "5 0",
    fontSize: 9,
  },
  bankTable: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    margin: "8 0",
    marginTop: 0,
  },
  bankCol40: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bankCol60: {
    width: "60%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bankCellBold: {
    margin: "auto",
    marginTop: 3,
    marginBottom: 3,
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: 6,
    marginRight: 6,
  },
  closing: {
    margin: "15 0 0 0",
  },
  sign: {
    position: "absolute",
    bottom: 190,
    right: 75,
    width: 50,
    height: 50,
  },
  signatureSpace: {
    marginTop: -20,
    textAlign: "right",
  },
});

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-IN");
};

export const DemandLetterPdf = ({
  data,
  letterHeadData,
  isSigned = false,
  includeLetterHead = false,
}: DemandLetterProps) => {
  const agreementValueNum = parseInt(
    data.financials.agreementValue.replace(/[^0-9]/g, ""),
  );
  const amountDue = Math.floor(
    (agreementValueNum * data.financials.projectStage) / 100,
  );
  const amountPayable = amountDue - data.financials.amountReceived;

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  };

  if (typeof window !== "undefined" && !window.Buffer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Buffer = Buffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).global = window;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {includeLetterHead && <LetterHead data={letterHeadData} />}
        <View style={styles.letterhead}>
          <Text style={styles.letterheadTitle}>DEMAND LETTER</Text>
        </View>

        <View style={styles.date}>
          <Text>Date: {formatDate(data.applicationInfo.date)}</Text>
        </View>

        <View style={styles.recipient}>
          <Text style={styles.recipientLabel}>To:</Text>
          <Text style={styles.recipientName}>
            Mr. {data.applicationInfo.applicant}
          </Text>
          {data.applicationInfo.coApplicant && (
            <Text style={styles.recipientName}>
              Mrs. {data.applicationInfo.coApplicant}
            </Text>
          )}
        </View>

        <View style={styles.greeting}>
          <Text>Dear Sir/Madam,</Text>
        </View>

        <View style={styles.subject}>
          <Text>
            Subject: Demand Letter for Unit {data.property.unitDetails.unitNo},{" "}
            {getOrdinal(data.property.unitDetails.floorNo)} Floor,{" "}
            {data.property.unitDetails.wing}-Wing at proposed building "
            {data.property.project.name}" situated at{" "}
            {data.property.project.address}.
          </Text>
        </View>

        <Text style={[styles.paragraph, { marginBottom: 4 }]}>
          With reference to the above booking, we would like to inform you that
          <Text style={styles.bold}>
            {` ${data.financials.projectStage}% `}
          </Text>
          work has been completed in our above project.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>
                WORK COMPLETED - FINANCIAL SUMMARY
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total Amount</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellRight}>
                Rs. {formatCurrency(agreementValueNum)}/-
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Amount Due</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellRight}>
                Rs. {formatCurrency(amountDue)}/-
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Amount Received</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellRight}>
                Rs. {formatCurrency(data.financials.amountReceived)}/-
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColHighlight}>
              <Text style={styles.tableCellBold}>Amount Payable</Text>
            </View>
            <View style={styles.tableColHighlight}>
              <Text style={styles.tableCellRight}>
                Rs. {formatCurrency(amountPayable)}/-
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.amountWords}>
          (Rupees: {numberToWords(amountPayable)})
        </Text>

        <Text style={styles.paragraph}>
          We request you to release the balance payment within 7 days, interest
          will be charged @24% per annum after 7 days.
        </Text>

        <Text style={[styles.paragraph, { marginBottom: 3 }]}>
          <Text style={styles.bold}>
            The cheque/payment to be made in favor of:
          </Text>
        </Text>

        <View style={styles.bankTable}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ACCOUNT DETAILS</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.bankCol40}>
              <Text style={styles.bankCellBold}>Account Name</Text>
            </View>
            <View style={styles.bankCol60}>
              <Text style={styles.bankCellBold}>{data.banking.holderName}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.bankCol40}>
              <Text style={styles.bankCellBold}>Bank Name</Text>
            </View>
            <View style={styles.bankCol60}>
              <Text style={styles.bankCellBold}>{data.banking.bank}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.bankCol40}>
              <Text style={styles.bankCellBold}>Branch</Text>
            </View>
            <View style={styles.bankCol60}>
              <Text style={styles.bankCellBold}>{data.banking.branch}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.bankCol40}>
              <Text style={styles.bankCellBold}>Account Number</Text>
            </View>
            <View style={styles.bankCol60}>
              <Text style={styles.bankCellBold}>{data.banking.accountNo}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.bankCol40}>
              <Text style={styles.bankCellBold}>IFSC Code</Text>
            </View>
            <View style={styles.bankCol60}>
              <Text style={styles.bankCellBold}>{data.banking.ifscCode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.closing}>
          <Text>Thanking You,</Text>
          <Text>Yours Faithfully</Text>
        </View>

        {isSigned && (
          <>
            <Image src={Sign} style={styles.sign} />
            <View style={styles.signatureSpace}>
              <Text>_________________________</Text>
              <Text>Authorized Signatory</Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};
