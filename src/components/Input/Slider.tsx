import { MAX_ANIMATION_SPEED, MNI_ANIMATION_SPEED } from "@/lib/utils";

export const Slider = ({
  firstText,
  lastText,
  min,
  max,
  step,
  value,
  handleChange,
  isDisabled = false,
}: {
  firstText: string;
  lastText: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
}) => {
  return (
    <div className="flex gap-2 items-center justify-center">
      <span className="text-center text-gray-300">{firstText}</span>
      <input
        disabled={isDisabled}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e)}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
      />
      <span className="text-center text-gray-300">{lastText}</span>
    </div>
  );
};