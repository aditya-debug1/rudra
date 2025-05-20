interface UserFooterProps {
  currClients: number;
  totalClients: number;
}

export const UserFooter = ({ currClients, totalClients }: UserFooterProps) => {
  return (
    <div className="text-sm text-muted-foreground text-center md:text-left w-full px-1">
      Showing {currClients} of {totalClients} users
    </div>
  );
};
