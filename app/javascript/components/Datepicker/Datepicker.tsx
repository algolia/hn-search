import * as React from "react";
import DayPicker from "react-day-picker";
import "./Datepicker.scss";
import "react-day-picker/lib/style.css";

import { Calendar } from "react-feather";

const isSelectingFirstDay = (from: Date, to: Date, day: Date) => {
  const isBeforeFirstDay = from && DayPicker.DateUtils.isDayBefore(day, from);
  const isRangeSelected = from && to;
  return !from || isBeforeFirstDay || isRangeSelected;
};

interface DatePickerState {
  from: Date;
  to: Date;
  enteredTo: Date;
}

const DEFAULT_STATE: DatePickerState = {
  from: null,
  to: null,
  enteredTo: null
};

interface DatePickerProps {
  isOpen: boolean;
  onChange: (from: Date, to: Date) => any;
  onCancel: () => any;
  onBlur: () => any;
}

const DatePicker: React.FunctionComponent<DatePickerProps> = ({
  isOpen,
  onCancel,
  onChange
}) => {
  const [state, setState] = React.useState(DEFAULT_STATE);

  const handleResetClick = React.useCallback(() => {
    setState({
      from: null,
      to: null,
      enteredTo: null
    });
  }, []);

  const handleDayClick = React.useCallback(
    (day: Date) => {
      const { from, to } = state;

      if (from && to && day >= from && day <= to) {
        return handleResetClick();
      }
      if (isSelectingFirstDay(from, to, day)) {
        setState({
          from: day,
          to: null,
          enteredTo: null
        });
      } else {
        setState({
          to: day,
          from: state.from,
          enteredTo: day
        });
        onChange(from, day);
      }
    },
    [state]
  );

  const handleDayMouseEnter = React.useCallback(
    (day: Date) => {
      const { from, to } = state;
      if (!isSelectingFirstDay(from, to, day)) {
        setState({
          from: state.from,
          to: state.to,
          enteredTo: day
        });
      }
    },
    [state]
  );

  const { from, enteredTo } = state;
  const modifiers = { start: from, end: enteredTo };
  const disabledDays = { before: state.from };
  const selectedDays = [from, { from, to: enteredTo }];

  if (!isOpen) return null;

  return (
    <div className="DatePicker">
      <div className="DatePicker-container">
        <DayPicker
          className="Range"
          numberOfMonths={1}
          fromMonth={from}
          selectedDays={selectedDays}
          disabledDays={disabledDays}
          modifiers={modifiers}
          onDayClick={handleDayClick}
          onDayMouseEnter={handleDayMouseEnter}
        />
        <form
          className="DatePicker_form"
          action=""
          onSubmit={event => {
            event.preventDefault();
            onChange(state.from, state.to);
          }}
        >
          <fieldset>
            <h3>
              <Calendar />
              Custom Date Range
            </h3>
            <div>
              <label htmlFor="from">From</label>
              <input
                id="from"
                type="date"
                onChange={event => {
                  setState({
                    ...state,
                    from: new Date(event.currentTarget.value)
                  });
                }}
                placeholder="From date"
              />
            </div>
            <div>
              <label htmlFor="to">To</label>
              <input
                id="to"
                type="date"
                placeholder="To date"
                onChange={event => {
                  setState({
                    ...state,
                    to: new Date(event.currentTarget.value)
                  });
                }}
              />
            </div>
            <div className="DatePicker_actions">
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" disabled={!state.from || !state.to}>
                Apply
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default DatePicker;
