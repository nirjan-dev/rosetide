interface FlowIntensitySliderProps {
  /**
   * The current intensity value, from 1 to 5.
   */
  value: number;
  /**
   * Callback function that is fired when the user selects a new intensity.
   */
  onChange: (newIntensity: number) => void;
  /**
   * Disables the input if set to true.
   * @default false
   */
  disabled?: boolean;
}

/**
 * A UI component for selecting menstrual flow intensity on a 1-5 scale.
 * It is implemented as a controlled component using a DaisyUI "rating" input.
 */
export function FlowIntensitySlider({
  value,
  onChange,
  disabled = false,
}: FlowIntensitySliderProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <label className="text-sm font-medium text-center text-base-content/70">
        Flow Intensity
      </label>
      <div className="rating rating-lg">
        {/* Create 5 radio buttons for the rating */}
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <input
              key={ratingValue}
              type="radio"
              name="flow-rating"
              className="mask mask-heart bg-red-400"
              checked={value === ratingValue}
              onChange={() => onChange(ratingValue)}
              disabled={disabled}
              aria-label={`${ratingValue} out of 5`}
            />
          );
        })}
      </div>
    </div>
  );
}
