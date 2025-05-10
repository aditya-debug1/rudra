import CambriaBoldItalic from "@/fonts/cambria/Cambria Bold Italic.ttf";
import CambriaBold from "@/fonts/cambria/Cambria Bold.ttf";
import CambriaItalic from "@/fonts/cambria/Cambria Italic.ttf";
import CambriaRegular from "@/fonts/cambria/Cambria.ttf";
import { capitalizeWords, toProperCase } from "@/utils/func/strUtils";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Type
type PropertyType = "flat" | "shop" | "office";

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

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 120,
    paddingLeft: 80,
    paddingRight: 80,
    fontSize: 12,
    fontFamily: "Cambria",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 20,
  },
  signature: {
    marginTop: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  underline: {
    textDecoration: "underline",
  },
  subject: {
    marginBottom: 15,
    marginTop: 5,
  },
  address: {
    marginBottom: 3,
    width: "40%",
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 15,
  },
  rightAligned: {
    marginLeft: "auto",
  },
});

// Types
interface PropertyDetails {
  type: PropertyType;
  wing?: string;
  unitNo: string;
}

interface ProjectDetails {
  name: string;
  by: string;
  location: string;
}

interface CancellationData {
  project: ProjectDetails;
  property: PropertyDetails;
  date: Date;
  holder: string;
}

interface CancellationLetterProps {
  data: CancellationData;
}

// Helper functions
const formatDate = (date: Date): string => {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatPropertyIdentifier = (property: PropertyDetails): string => {
  const { type, wing, unitNo } = property;
  return `${toProperCase(type)} ${wing ? `${wing}-` : ""}${unitNo}`;
};

/**
 * CancellationLetter Component
 * Generates a PDF document for property booking cancellation
 */
export const CancellationLetter = ({ data }: CancellationLetterProps) => {
  const { project, property, date, holder } = data;
  const propertyIdentifier = formatPropertyIdentifier(property);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Date Section */}
        <View style={[styles.section, styles.rightAligned]}>
          <Text>{`Date: ${formatDate(date)}`}</Text>
        </View>

        {/* Addressee Section */}
        <View style={styles.section}>
          <Text>To,</Text>
          <Text style={styles.address}>Rudra Developers</Text>
          <Text style={styles.address}>
            {capitalizeWords(project.by.toLowerCase())}
          </Text>
          <Text style={styles.address}>{project.location}</Text>
        </View>

        {/* Subject Section */}
        <View style={styles.section}>
          <Text style={styles.subject}>
            {"Subject: "}
            <Text style={styles.bold}>
              {`Request for Cancellation of Booking – ${propertyIdentifier}`}
            </Text>
          </Text>
        </View>

        {/* Salutation */}
        <View style={styles.section}>
          <Text>Dear Sir,</Text>
        </View>

        {/* Body Paragraphs */}
        <View style={styles.paragraph}>
          <Text>
            I, <Text style={styles.bold}>{holder}</Text>, had booked
            <Text style={styles.bold}>{` ${propertyIdentifier} `}</Text>
            at your <Text style={styles.bold}>{project.name}</Text> project. I
            hereby formally request the cancellation of my booking for the
            mentioned {data.property.type.toLowerCase()}.
          </Text>
        </View>

        <View style={styles.paragraph}>
          <Text>
            Due to personal reasons, I am unable to proceed with this booking. I
            kindly request you to initiate the process for cancellation and
            arrange for the refund of the amount I have paid to date.
          </Text>
        </View>

        <View style={styles.paragraph}>
          <Text>
            I appreciate your prompt attention to this matter and look forward
            to your confirmation. Please feel free to contact me if any
            additional details or formalities are required.
          </Text>
        </View>

        <View style={styles.section}>
          <Text>Thank you for your cooperation.</Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signature}>
          <Text>Warm regards,</Text>
          <Text>{holder}</Text>
        </View>
      </Page>
    </Document>
  );
};
