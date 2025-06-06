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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

const generateDummyData = () => {
  // Real estate booking targets and achievements
  const monthlyTarget = 5; // Target: 5 house bookings per month
  const achievedBookings = 2; // Achieved: 4 bookings so far this month

  return {
    achieved: achievedBookings,
    target: monthlyTarget,
  };
};

// Custom colors for booking chart
const targetColors = {
  achieved: "oklch(79.2% 0.209 151.711)", // Green color
  balance: "oklch(63.7% 0.237 25.331)", // Red Color
};

interface TargetChartProps {
  manager?: string;
  employeeName?: string;
}

export default function TargetChart({ manager }: TargetChartProps) {
  const now = new Date();

  const isLoading = false;
  const targetData = generateDummyData();

  // Transform API data to chart format
  const chartData = React.useMemo(() => {
    if (!targetData) return [];

    const achieved = targetData.achieved || 0;
    const target = targetData.target || 0;
    const balance = Math.max(0, target - achieved);

    return [
      {
        period: "Current Month",
        achieved,
        balance,
      },
    ];
  }, [targetData]);

  const { totalTarget, achievedAmount, balanceAmount, achievementPercentage } =
    React.useMemo(() => {
      if (!targetData) {
        return {
          totalTarget: 0,
          achievedAmount: 0,
          balanceAmount: 0,
          achievementPercentage: 0,
        };
      }

      const achieved = targetData.achieved || 0;
      const target = targetData.target || 0;
      const balance = Math.max(0, target - achieved);
      const percentage = target > 0 ? (achieved / target) * 100 : 0;

      return {
        totalTarget: target,
        achievedAmount: achieved,
        balanceAmount: balance,
        achievementPercentage: percentage,
      };
    }, [targetData]);

  const hasData = totalTarget > 0;
  const isOverAchieved = achievedAmount > totalTarget;

  const chartConfig = {
    achieved: {
      label: "Bookings",
      color: targetColors.achieved,
    },
    balance: {
      label: "Remaining",
      color: targetColors.balance,
    },
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl">Target Progress</CardTitle>
          <CardDescription className="text-base">
            {format(now, "MMMM yyyy")} {manager && `• ${manager}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader />
          </div>
        ) : hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto translate-y-8 w-full h-[200px] sm:h-[220px] overflow-hidden"
          >
            <RadialBarChart
              data={chartData}
              startAngle={180}
              endAngle={0}
              innerRadius="80%"
              outerRadius="160%"
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 20}
                            className="fill-foreground text-2xl sm:text-3xl font-bold"
                          >
                            {achievementPercentage.toFixed(0)}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 5}
                            className="fill-muted-foreground text-xs sm:text-sm font-medium"
                          >
                            Targets Achieved
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="achieved"
                stackId="target"
                cornerRadius={8}
                fill="var(--color-achieved)"
                className="stroke-transparent stroke-2"
              />
              {!isOverAchieved && (
                <RadialBar
                  dataKey="balance"
                  fill="var(--color-balance)"
                  stackId="target"
                  cornerRadius={8}
                  className="stroke-transparent stroke-2"
                />
              )}
            </RadialBarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">
              No booking data available for this month
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-3 text-sm pt-0">
        {hasData && (
          <div className="flex items-center justify-center gap-2 leading-none font-medium text-sm sm:text-base">
            {isOverAchieved ? (
              <>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Target exceeded by {achievedAmount - totalTarget} bookings
              </>
            ) : achievementPercentage >= 80 ? (
              <>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Excellent progress - {achievementPercentage.toFixed(1)}%
                completed
              </>
            ) : achievementPercentage >= 50 ? (
              <>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                {balanceAmount} more bookings needed to reach target
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                {balanceAmount} more bookings needed to reach target
              </>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mx-auto text-center">
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Bookings Done
            </div>
            <div className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-500">
              {achievedAmount} bookings
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Monthly Target
            </div>
            <div className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400">
              {totalTarget} bookings
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
