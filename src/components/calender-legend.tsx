import clsx from "clsx";

const Legend = ({ text, color }: { text: string; color: string }) => {
  return (
    <div className="flex items-center gap-2 py-1 pl-5">
      <div
        className={clsx("w-2 h-2 rounded-full", {
          "bg-red-400": color === "red",
          "bg-yellow-400": color === "yellow",
          "bg-blue-400": color === "blue",
          // Add other colors as needed
        })}
      ></div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};

export default Legend;
