const EmptyTimeslot = ({ handleClick }: { handleClick: () => void }) => {
  return <td onClick={handleClick} className="border border-gray-300"></td>;
};

export default EmptyTimeslot;
