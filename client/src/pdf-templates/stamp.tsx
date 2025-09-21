// InkedRectStamp.tsx
import { Path, Svg, Text } from "@react-pdf/renderer";
import React from "react";
type Props = {
  companyName: string;
  width?: number;
  height?: number;
  color?: string;
  seed?: number;
  rotateDeg?: number;
  noise?: number; // 0..1
  fontSize?: number;
  fontFamily?: string; // registered font
  bottomText?: string; // default: "Authorised Signatory"
};
const InkedRectStamp: React.FC<Props> = ({
  companyName,
  width = 160,
  height = 90,
  color = "#7f76e5",
  seed = 1307,
  rotateDeg = 0,
  noise = 0,
  fontSize = 12,
  fontFamily,
  bottomText = "Authorised Signatory",
}) => {
  // --- tiny deterministic PRNG (xorshift32) ---
  const rng = (s: number) => () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  const rand = rng(seed);
  const pad = 12;
  const x = pad,
    y = pad;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const cx = width / 2;
  const transform = `rotate(${rotateDeg} ${cx} ${height / 2})`;
  // --- helpers ---
  const specklesD = () => {
    const count = Math.floor(((w * h) / 1000) * noise);
    if (count <= 0) return "";
    let d = "";
    for (let i = 0; i < count; i++) {
      const sx = x + rand() * w,
        sy = y + rand() * h;
      const r = 0.35 + rand() * 0.85;
      d += `M ${sx - r} ${sy} l ${2 * r} 0 m ${-r} ${-r} l 0 ${2 * r} `;
    }
    return d;
  };
  const textSet = (text: string, yPos: number, key: string, bold = true) => {
    const base = { fontSize, fontFamily, fill: color } as const;
    const main = { ...base, fontWeight: bold ? ("bold" as const) : undefined };
    const ghost = { ...base, opacity: 0.35 };
    return [
      <Text
        key={`${key}-0`}
        x={cx}
        y={yPos}
        textAnchor="middle"
        transform={transform}
        style={main}
      >
        {text}
      </Text>,
      <Text
        key={`${key}-1`}
        x={cx + 0.7}
        y={yPos + 0.8}
        textAnchor="middle"
        transform={transform}
        style={ghost}
      >
        {text}
      </Text>,
      <Text
        key={`${key}-2`}
        x={cx - 0.8}
        y={yPos - 0.7}
        textAnchor="middle"
        transform={transform}
        style={ghost}
      >
        {text}
      </Text>,
    ];
  };
  // --- layout ---
  const topY = y + 24;
  const botY = y + h - 8;
  // --- paths ---
  const noisePath = specklesD();
  return (
    <Svg width={width} height={height}>
      {noisePath && (
        <Path
          d={noisePath}
          stroke={color}
          strokeWidth={0.55}
          opacity={0.18}
          transform={transform}
        />
      )}
      {textSet(`For ${companyName}`, topY, "top")}
      {textSet(bottomText, botY, "bot")}
    </Svg>
  );
};
export default InkedRectStamp;
