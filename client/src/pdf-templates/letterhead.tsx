// components/LetterHead.tsx
import CambriaBoldItalic from "@/fonts/cambria/Cambria Bold Italic.ttf";
import CambriaBold from "@/fonts/cambria/Cambria Bold.ttf";
import CambriaItalic from "@/fonts/cambria/Cambria Italic.ttf";
import CambriaRegular from "@/fonts/cambria/Cambria.ttf";
import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import LetterHeadBG from "../assets/LetterHeadBG.png";
import StigmaRegular from "../fonts/stigma/Stigma-Display.ttf";

// Combined font registration with error handling
const registerFonts = () => {
  try {
    // Register Stigma font
    Font.register({
      family: "Stigma",
      fonts: [
        {
          src: StigmaRegular,
          fontWeight: "normal",
          fontStyle: "normal",
        },
      ],
    });

    // Register Cambria font family
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
  } catch (error) {
    console.warn("Font registration failed:", error);
    // Fallback to system fonts if custom font fails
  }
};

// Register all fonts once
registerFonts();

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  companyName: {
    top: 50,
    left: 60,
    fontSize: 40,
    color: "#9e2721",
    fontFamily: "Stigma", // Will fallback to default if Stigma fails
  },
  address: {
    position: "absolute",
    bottom: 83,
    left: 45,
    fontSize: 10,
    color: "#000000",
    fontFamily: "Cambria",
  },
  email: {
    position: "absolute",
    bottom: 60,
    left: 45,
    fontSize: 10,
    color: "#000000",
    fontFamily: "Cambria",
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

type LetterHeadProps = {
  data: {
    name: string;
    address: string;
    email: string;
  };
};

const LetterHead = ({ data }: LetterHeadProps) => (
  <>
    {data && (
      <View style={styles.container}>
        <Text style={styles.companyName}>{data.name}</Text>
        <Image src={LetterHeadBG} style={styles.bg} />
        <Text style={styles.address}>{data.address}</Text>
        <Text style={styles.email}>{data.email.toLowerCase()}</Text>
      </View>
    )}
  </>
);

export default LetterHead;
