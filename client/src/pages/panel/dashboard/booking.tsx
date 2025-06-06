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
import { useYearlyBookingStats } from "@/store/analytics";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

// Custom label formatter to prevent overflow
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizedLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={12}
      fill="currentColor"
      className="fill-foreground"
    >
      {value}
    </text>
  );
};

const chartConfig = {
  client: {
    label: "Client",
    color: "hsl(220 70% 50%)",
  },
  booking: {
    label: "Booking",
    color: "hsl(160 60% 45%)",
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

interface BookingChartProps {
  manager?: string;
}

// Main Chart
export default function BookingChart({ manager }: BookingChartProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 640px)");
  const [barGap, setBarGap] = useState(8);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const yearOptions = generateYearOptions(2025);

  const { data: bookingData, isLoading } = useYearlyBookingStats({
    year: selectedYear,
    manager,
  });

  // Responsive margin to prevent label overlap
  useEffect(() => {
    // Adjust spacing based on screen size
    if (isDesktop) {
      setBarGap(8);
    } else if (isTablet) {
      setBarGap(4);
    } else {
      setBarGap(2);
    }
  }, [isDesktop, isTablet]);

  // Calculate the change percentage between current and previous month's booking rate
  const trendingStats = useMemo(() => {
    if (
      !bookingData ||
      !bookingData.monthlyStats ||
      bookingData.monthlyStats.length < 2
    ) {
      return { percentage: 0, isUp: true };
    }

    const monthlyStats = bookingData.monthlyStats;
    // Sort by months in case they're not already ordered
    const sortedStats = [...monthlyStats].sort((a, b) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Get the most recent two months with data
    const currentMonth = sortedStats[sortedStats.length - 1];
    const previousMonth = sortedStats[sortedStats.length - 2];

    if (!currentMonth || !previousMonth) {
      return { percentage: 0, isUp: true };
    }

    // Calculate booking rates
    const currentRate = currentMonth.booking / currentMonth.client;
    const previousRate = previousMonth.booking / previousMonth.client;

    // Calculate percentage change
    let percentChange = 0;
    let isUp = true;

    if (previousRate === 0) {
      // If previous rate was 0, we can't calculate percentage increase
      percentChange = currentRate > 0 ? 100 : 0;
    } else {
      percentChange = ((currentRate - previousRate) / previousRate) * 100;
      isUp = percentChange >= 0;
    }

    return {
      percentage: Math.abs(percentChange).toFixed(1),
      isUp,
    };
  }, [bookingData]);

  // Format chart data from API response
  const chartData = useMemo(() => {
    if (!bookingData || !bookingData.monthlyStats) return [];
    return bookingData.monthlyStats.map((stat) => ({
      month: stat.month,
      client: stat.client,
      booking: stat.booking,
    }));
  }, [bookingData]);

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year, 10));
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex-row justify-between">
        <div>
          <CardTitle>Booking Chart</CardTitle>
          <CardDescription>Monthly Client Bookings</CardDescription>
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
          <ChartContainer config={chartConfig} className="h-[45vh] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              barGap={barGap}
              margin={{ top: 30, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="client"
                fill="var(--color-client)"
                radius={4}
                minPointSize={2}
              >
                {isTablet && (
                  <LabelList dataKey="client" content={CustomizedLabel} />
                )}
              </Bar>
              <Bar
                dataKey="booking"
                fill="var(--color-booking)"
                radius={4}
                minPointSize={2}
              >
                {isTablet && (
                  <LabelList dataKey="booking" content={CustomizedLabel} />
                )}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[45vh]">
            <p className="text-muted-foreground">
              No booking data available for {selectedYear}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {bookingData &&
          bookingData.monthlyStats &&
          bookingData.monthlyStats.length > 0 && (
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
          {bookingData ? (
            <>
              Total bookings: {bookingData.summary.totalBookingsForYear} / Total
              clients: {bookingData.summary.totalClientsForYear}
              {` (Avg: ${bookingData.summary.averageBookingRate.toFixed(1)}%)`}
            </>
          ) : (
            `Showing booking data for ${selectedYear}`
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
