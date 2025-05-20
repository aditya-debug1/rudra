interface UserFooterProps {
  currClients: number;
  totalClients: number;
}

export const UserFooter = ({ currClients, totalClients }: UserFooterProps) => {
  return (
    <h3 className="text-primary/60 font-semibold text-center md:text-left w-full px-1">
      Showing {currClients} of {totalClients} clients
    </h3>
  );
};
