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
import { useClientStatusCounts } from "@/store/analytics";
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

// Custom shadcn-inspired pastel colors for each status
const statusColors = {
  booked: "oklch(72.3% 0.219 149.579)", // Green
  hot: "oklch(70.5% 0.213 47.604)", // Orange
  warm: "oklch(87.9% 0.169 91.605)", // Yellow
  cold: "oklch(58.8% 0.158 241.966)", // Blue
  lost: "oklch(63.7% 0.237 25.331)", // Red
};

// Helper to format date as ISO string
const formatDateForApi = (date: Date) => format(date, "yyyy-MM-dd");

interface StatusChartProps {
  manager?: string;
}

export default function StatusChart({ manager }: StatusChartProps) {
  const [filter, setFilter] = React.useState("all");
  const now = new Date();

  // Determine date range based on filter
  const getDateRange = (filterValue: string) => {
    switch (filterValue) {
      case "this_month":
        return {
          startDate: formatDateForApi(startOfMonth(now)),
          endDate: formatDateForApi(endOfMonth(now)),
        };
      case "last_month":
        return {
          startDate: formatDateForApi(startOfMonth(subMonths(now, 1))),
          endDate: formatDateForApi(endOfMonth(subMonths(now, 1))),
        };
      case "last_3_months":
        return {
          startDate: formatDateForApi(subMonths(now, 3)),
          endDate: formatDateForApi(now),
        };
      case "last_6_months":
        return {
          startDate: formatDateForApi(subMonths(now, 6)),
          endDate: formatDateForApi(now),
        };
      case "ytd":
        return {
          startDate: formatDateForApi(startOfYear(now)),
          endDate: formatDateForApi(now),
        };
      case "last_year":
        return {
          startDate: formatDateForApi(subMonths(now, 12)),
          endDate: formatDateForApi(now),
        };
      case "all":
      default:
        return {
          startDate: undefined,
          endDate: undefined,
        };
    }
  };

  const { startDate, endDate } = getDateRange(filter);

  const { data: statusData, isLoading } = useClientStatusCounts({
    startDate,
    endDate,
    manager,
  });

  // Transform API data to chart format
  const chartData = React.useMemo(() => {
    if (!statusData) return [];

    const data = [
      {
        status: "booked",
        clients: statusData.booked,
        fill: statusColors.booked,
      },
      { status: "hot", clients: statusData.hot, fill: statusColors.hot },
      { status: "warm", clients: statusData.warm, fill: statusColors.warm },
      { status: "cold", clients: statusData.cold, fill: statusColors.cold },
      { status: "lost", clients: statusData.lost, fill: statusColors.lost },
    ];

    // Filter out statuses with 0 clients
    return data.filter((item) => item.clients > 0);
  }, [statusData]);

  const totalClients = React.useMemo(() => {
    if (!statusData) return 0;
    return Object.values(statusData).reduce((acc, curr) => acc + curr, 0);
  }, [statusData]);

  const hasData = totalClients > 0;

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3M" },
    { value: "last_6_months", label: "Last 6M" },
    { value: "ytd", label: "Year to Date (YTD)" },
    { value: "last_year", label: "Last Year" },
  ];

  // Get display text for footer
  const getDateRangeText = () => {
    switch (filter) {
      case "this_month":
        return `Showing clients for ${format(now, "MMMM yyyy")}`;
      case "last_month":
        return `Showing clients for ${format(subMonths(now, 1), "MMMM yyyy")}`;
      case "last_3_months":
        return `Showing clients from ${format(subMonths(now, 3), "MMM")} - ${format(now, "MMM yyyy")}`;
      case "last_6_months":
        return `Showing clients from ${format(subMonths(now, 6), "MMM")} - ${format(now, "MMM yyyy")}`;
      case "ytd":
        return `Showing clients from Jan - ${format(now, "MMM yyyy")}`;
      case "last_year":
        return `Showing clients from last 12 months`;
      case "all":
      default:
        return "Showing all clients";
    }
  };

  const chartConfig = {
    clients: {
      label: "Clients",
    },
    hot: {
      label: "Hot",
      color: statusColors.hot,
    },
    warm: {
      label: "Warm",
      color: statusColors.warm,
    },
    booked: {
      label: "Booked",
      color: statusColors.booked,
    },
    cold: {
      label: "Cold",
      color: statusColors.cold,
    },
    lost: {
      label: "Lost",
      color: statusColors.lost,
    },
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="flex-row justify-between">
        <div className="flex flex-col space-y-1.5">
          <CardTitle>Status Chart</CardTitle>
          <CardDescription>Client Status Distribution</CardDescription>
        </div>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader />
          </div>
        ) : hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Pie
                data={chartData}
                dataKey="clients"
                label
                labelLine={{ strokeWidth: 2 }}
                nameKey="status"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalClients.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Clients
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">
              No client data available for this period
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-3 text-center">
        {getDateRangeText()}
      </CardFooter>
    </Card>
  );
}
