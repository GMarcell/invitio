type TicketEdgeProps = {
  position: "top" | "bottom";
};

export function TicketEdge({ position }: TicketEdgeProps) {
  return <span aria-hidden="true" className={`ticket-edge ticket-edge-${position}`} />;
}
