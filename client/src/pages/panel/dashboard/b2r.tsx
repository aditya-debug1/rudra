import { Loader } from "@/components/custom ui/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useYearlyRegistrationStats } from "@/store/analytics";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

const chartConfig = {
  registration: {
    label: "Registration",
    color: "hsl(141.9 69.2% 58%)",
  },
  booking: {
    label: "Booking",
    color: "hsl(45.9 96.7% 64.5%)",
  },
  canceled: {
    label: "Canceled",
    color: "oklch(63.7% 0.237 25.331)",
  },
} satisfies ChartConfig;

// Helper function for generating year options
function generateYearOptions(startYear: number) {
  const currentYear = new Date().getFullYear();
  const yearOptions = [];

  for (let year = startYear; year <= currentYear; year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return yearOptions;
}

interface BookingRegistrationChartProps {
  manager?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  // Only show label if the bar is tall enough and value is significant
  if (height < 2 || value < 0) return null;

  const textX = x + width / 2;
  const textY = y + height / 2;

  return (
    <g>
      {/* Shadow/outline effect */}
      <text
        x={textX}
        y={textY}
        fill="rgba(0, 0, 0, 0.8)"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="600"
        stroke="rgba(0, 0, 0, 0.7)"
        strokeWidth="1.2"
      >
        {value}
      </text>
      {/* Main text */}
      <text
        x={textX}
        y={textY}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  );
};

// Custom bar shape component that handles dynamic radius
interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  payload: {
    booking: number;
    registration: number;
    canceled: number;
  };
  dataKey: string;
}

const CustomBar = (props: CustomBarProps) => {
  const { x, y, width, height, fill, payload, dataKey } = props;

  if (height <= 0) return null;

  const hasBooking = payload.booking > 0;
  const hasRegistration = payload.registration > 0;
  const hasCanceled = payload.canceled > 0;

  // Count how many segments are present
  const segments = [hasBooking, hasRegistration, hasCanceled].filter(Boolean);
  const segmentCount = segments.length;

  let radius = [0, 0, 0, 0]; // [topLeft, topRight, bottomRight, bottomLeft]

  // If only one segment, make it fully rounded
  if (segmentCount === 1) {
    radius = [4, 4, 4, 4];
  } else {
    // For multiple segments, determine position in stack
    if (dataKey === "canceled") {
      // Canceled is at the bottom
      if (hasRegistration || hasBooking) {
        radius = [0, 0, 4, 4]; // Bottom rounded only
      }
    } else if (dataKey === "booking") {
      // Booking is in the middle
      const isTop = !hasRegistration;
      const isBottom = !hasCanceled;

      if (isTop) {
        radius = [4, 4, 0, 0]; // Top rounded only
      } else if (isBottom) {
        radius = [0, 0, 4, 4]; // Bottom rounded only
      }
      // Middle segments have no rounding
    } else if (dataKey === "registration") {
      // Canceled is at the top
      if (hasBooking || hasRegistration) {
        radius = [4, 4, 0, 0]; // Top rounded only
      }
    }
  }

  // Create path with rounded corners
  const [tl, tr, br, bl] = radius;
  const path = `
    M ${x + tl} ${y}
    L ${x + width - tr} ${y}
    Q ${x + width} ${y} ${x + width} ${y + tr}
    L ${x + width} ${y + height - br}
    Q ${x + width} ${y + height} ${x + width - br} ${y + height}
    L ${x + bl} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - bl}
    L ${x} ${y + tl}
    Q ${x} ${y} ${x + tl} ${y}
    Z
  `;

  return <path d={path} fill={fill} />;
};

// Main Chart Component
export default function BookingRegistrationChart({
  manager,
}: BookingRegistrationChartProps) {
  const isTablet = useMediaQuery("(min-width: 768px)");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const showLabels = true;

  // Use the registration stats query
  const {
    data: registrationData,
    isLoading,
    error,
  } = useYearlyRegistrationStats({
    year: selectedYear,
    manager,
  });

  const yearOptions = generateYearOptions(2025);

  // Transform API data for chart consumption
  const chartData = useMemo(() => {
    if (!registrationData?.monthlyStats) {
      return [];
    }
    return registrationData.monthlyStats;
  }, [registrationData]);

  // Calculate the change percentage between current and previous month's registration rate
  const trendingStats = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { percentage: 0, isUp: true };
    }

    // Get the most recent two months with data (filter out months with no activity)
    const monthsWithData = chartData.filter(
      (month) =>
        month.booking > 0 || month.registration > 0 || month.canceled > 0,
    );

    if (monthsWithData.length < 2) {
      return { percentage: 0, isUp: true };
    }

    const currentMonth = monthsWithData[monthsWithData.length - 1];
    const previousMonth = monthsWithData[monthsWithData.length - 2];

    if (!currentMonth || !previousMonth) {
      return { percentage: 0, isUp: true };
    }

    // Calculate registration rates (registration/booking ratio)
    const currentRate =
      currentMonth.booking > 0
        ? currentMonth.registration / currentMonth.booking
        : 0;
    const previousRate =
      previousMonth.booking > 0
        ? previousMonth.registration / previousMonth.booking
        : 0;

    // Calculate percentage change
    let percentChange = 0;
    let isUp = true;

    if (previousRate === 0) {
      percentChange = currentRate > 0 ? 100 : 0;
    } else {
      percentChange = ((currentRate - previousRate) / previousRate) * 100;
      isUp = percentChange >= 0;
    }

    return {
      percentage: Math.abs(percentChange).toFixed(1),
      isUp,
    };
  }, [chartData]);

  // Get summary statistics from API response
  const summaryStats = useMemo(() => {
    if (!registrationData?.summary) {
      return {
        totalRegistrations: 0,
        totalBookings: 0,
        totalCanceled: 0,
        registrationRate: 0,
      };
    }

    return {
      totalBookings: registrationData.summary.totalBookingsForYear,
      totalRegistrations: registrationData.summary.totalRegistrationsForYear,
      totalCanceled: registrationData.summary.totalCanceledForYear,
      registrationRate: registrationData.summary.registrationRate,
    };
  }, [registrationData]);

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year, 10));
  };

  // Handle error state
  if (error) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Registration Chart</CardTitle>
          <CardDescription>
            Monthly Registration, Booking, and Cancellation Comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[45vh]">
            <p className="text-destructive">
              Error loading registration data. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex-row justify-between">
        <div>
          <CardTitle>Registration Chart</CardTitle>
          <CardDescription>
            Monthly Registration, Booking, and Cancellation Comparison
          </CardDescription>
        </div>
        <Select
          value={selectedYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[45vh]">
            <Loader />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[45vh] min-h-44 w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={{ fill: "transparent" }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="canceled"
                stackId="a"
                fill="var(--color-canceled)"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => (
                  <CustomBar {...props} dataKey="canceled" />
                )}
              >
                {isTablet && showLabels && (
                  <LabelList
                    dataKey="canceled"
                    position="center"
                    content={CustomLabel}
                  />
                )}
              </Bar>
              <Bar
                dataKey="booking"
                stackId="a"
                fill="var(--color-booking)"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => (
                  <CustomBar {...props} dataKey="booking" />
                )}
              >
                {isTablet && showLabels && (
                  <LabelList
                    dataKey="booking"
                    position="center"
                    content={CustomLabel}
                  />
                )}
              </Bar>
              <Bar
                dataKey="registration"
                stackId="a"
                fill="var(--color-registration)"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                shape={(props: any) => (
                  <CustomBar {...props} dataKey="registration" />
                )}
              >
                {isTablet && showLabels && (
                  <LabelList
                    dataKey="registration"
                    position="center"
                    content={CustomLabel}
                  />
                )}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[45vh]">
            <p className="text-muted-foreground">
              No registration/booking data available for {selectedYear}
              {manager && ` for manager: ${manager}`}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {chartData && chartData.length > 0 && (
          <div className="flex gap-2 font-medium leading-none">
            {trendingStats.isUp ? (
              <>
                Trending up by {trendingStats.percentage}% this month{" "}
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Trending down by {trendingStats.percentage}% this month{" "}
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          Total registrations: {summaryStats.totalRegistrations} / Total
          bookings: {summaryStats.totalBookings} / Total canceled:{" "}
          {summaryStats.totalCanceled}
          {` (Registration rate: ${summaryStats.registrationRate.toFixed(1)}%)`}
        </div>
      </CardFooter>
    </Card>
  );
}
