import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./WeekPicker.css";

function getDefaultWeeks(totalWeeks = 35) {
  return Array.from({ length: totalWeeks }, (_, index) => ({
	value: index + 1,
	label: `Tuan ${index + 1}`,
  }));
}

export default function WeekPicker({
  value = 1,
  onChange,
  totalWeeks = 35,
  weeks,
  label = "Tuan hoc",
}) {
  const options = weeks?.length ? weeks : getDefaultWeeks(totalWeeks);

  const handleWeekChange = (newValue) => {
	if (typeof onChange === "function") {
	  onChange(newValue);
	}
  };

  const handlePrev = () => {
	if (value <= 1) return;
	handleWeekChange(value - 1);
  };

  const handleNext = () => {
	if (value >= options.length) return;
	handleWeekChange(value + 1);
  };

  return (
	<div className="common-week-picker" aria-label="Bo chon tuan">
	  <span className="common-week-picker__label">{label}</span>

	  <div className="common-week-picker__controls">
		<button
		  type="button"
		  className="common-week-picker__nav"
		  onClick={handlePrev}
		  disabled={value <= 1}
		  aria-label="Tuan truoc"
		>
		  <FiChevronLeft />
		</button>

		<select
		  className="common-week-picker__select"
		  value={value}
		  onChange={(event) => handleWeekChange(Number(event.target.value))}
		>
		  {options.map((option) => (
			<option key={option.value} value={option.value}>
			  {option.label}
			</option>
		  ))}
		</select>

		<button
		  type="button"
		  className="common-week-picker__nav"
		  onClick={handleNext}
		  disabled={value >= options.length}
		  aria-label="Tuan sau"
		>
		  <FiChevronRight />
		</button>
	  </div>
	</div>
  );
}

