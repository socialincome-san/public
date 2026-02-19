type StatProps = { label: string; value: string | number };

export const Stat = ({ label, value }: StatProps) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
};
