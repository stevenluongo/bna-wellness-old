export interface CreateCheckModalProps {
  handleChange: (v: boolean) => void;
  open: boolean;
  timeslot: Moment | null;
  roomId: string;
  weekStart: string;
}
