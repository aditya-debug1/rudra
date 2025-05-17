import { unitStatus } from "@/store/inventory";
import { G, Path, Rect, Svg, Text } from "@react-pdf/renderer";
import _ from "lodash";
import { getStatusColor } from "./utils";

interface BarChartProps {
  data: Record<Exclude<unitStatus, "not-for-sale">, number>;
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
}

export const BarChart = ({
  data,
  width = 500,
  height = 200,
  barWidth = 35,
  barGap = 15,
}: BarChartProps) => {
  const maxValue = Math.max(...Object.values(data)) || 1;
  const scale = (height - 40) / maxValue; // Leave room for labels
  const statusLabels = Object.keys(data) as Array<
    Exclude<unitStatus, "not-for-sale">
  >;

  return (
    <Svg width={width} height={height}>
      {/* Y-Axis */}
      <Path
        d={`M 50,10 L 50,${height - 25}`}
        stroke="#CBD5E1"
        strokeWidth={1}
      />
      {/* X-Axis */}
      <Path
        d={`M 50,${height - 25} L ${width - 10},${height - 25}`}
        stroke="#CBD5E1"
        strokeWidth={1}
      />
      {/* Bars */}
      {statusLabels.map((status, index) => {
        const value = data[status];
        const barHeight = value * scale;
        const x = 65 + index * (barWidth + barGap);
        const y = height - 25 - barHeight;
        const fillColor = getStatusColor(status);
        const textColor = status === "available" ? "#696969" : fillColor;
        return (
          <G key={index}>
            {/* Bar */}
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={fillColor}
              stroke={"#000000"}
              strokeWidth={1}
            />
            {/* Value on top of bar */}
            <Text
              x={x + barWidth / 2}
              y={y - 10}
              style={{
                fontSize: 8,
                textAnchor: "middle",
                fontWeight: "bold",
                fill: textColor,
              }}
            >
              {value}
            </Text>
            {/* X-Axis Label */}
            <Text
              x={x + barWidth / 2}
              y={height - 10}
              style={{
                fontSize: 8,
                textAnchor: "middle",
                fill: "#64748B",
              }}
            >
              {_.startCase(status)}
            </Text>
          </G>
        );
      })}
      {/* Y-Axis labels */}
      {[0, maxValue / 4, maxValue / 2, (3 * maxValue) / 4, maxValue].map(
        (tickValue, index) => {
          const roundedValue = Math.round(tickValue);
          const y = height - 25 - roundedValue * scale;
          return (
            <G key={`y-tick-${index}`}>
              <Path
                d={`M 45,${y} L 50,${y}`}
                stroke="#CBD5E1"
                strokeWidth={1}
              />
              <Text
                x={40}
                y={y + 3}
                style={{
                  fontSize: 8,
                  textAnchor: "end",
                  fill: "#64748B",
                }}
              >
                {roundedValue}
              </Text>
            </G>
          );
        },
      )}
      {/* Y-Axis Title */}
      <Text
        x={15}
        y={height / 2}
        style={{
          fontSize: 8,
          textAnchor: "middle",
          fill: "#64748B",
          transform: `rotate(-90, 15, ${height / 2}) translate(-110%,-80%)`,
        }}
      >
        Number of Units
      </Text>
    </Svg>
  );
};
