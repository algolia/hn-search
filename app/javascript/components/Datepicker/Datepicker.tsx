import * as React from "react";
import * as moment from "moment";
import DayPicker from "react-day-picker";
import "./Datepicker.scss";
import "react-day-picker/lib/style.css";

import XCircle from "react-feather/dist/icons/x-circle";
import Calendar from "react-feather/dist/icons/calendar";

import { SearchContext } from "../../providers/SearchProvider";

const isSelectingFirstDay = (from: Date, to: Date, day: Date) => {
  const isBeforeFirstDay = from && DayPicker.DateUtils.isDayBefore(day, from);
  const isRangeSelected = from && to;
  return !from || isBeforeFirstDay || isRangeSelected;
};

const DEFAULT_FROM_DATE = moment().subtract(7, "days");
const DEFAULT_TO_DATE = moment();

interface DatePickerProps {
  isOpen: boolean;
  onChange: (from: Date, to: Date) => any;
  onCancel: () => any;
  onBlur: () => any;
}

const parseDate = (date: string, defaultDate: moment.Moment): moment.Moment => {
  if (!date) return moment(defaultDate);
  return moment.unix(parseInt(date));
};

const DatePicker: React.FunctionComponent<DatePickerProps> = ({
  isOpen,
  onCancel,
  onChange,
  onBlur
}) => {
  if (!isOpen) return null;

  const {
    settings: { dateEnd, dateStart }
  } = React.useContext(SearchContext);

  const [state, setState] = React.useState({
    from: parseDate(dateStart, DEFAULT_FROM_DATE).toDate(),
    to: parseDate(dateEnd, DEFAULT_TO_DATE).toDate(),
    enteredTo: parseDate(dateEnd, DEFAULT_TO_DATE).toDate()
  });

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
        const fromDate = moment.utc(day).toDate();

        setState({
          from: fromDate,
          to: null,
          enteredTo: fromDate
        });
      } else {
        const toDate = moment.utc(day).toDate();

        setState({
          from: state.from,
          to: toDate,
          enteredTo: toDate
        });
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
  const disabledDays = { after: new Date() };
  const selectedDays = [from, { from, to: enteredTo }];

  return (
    <div className="DatePicker">
      <div className="DatePicker-container">
        <DayPicker
          className="Range"
          numberOfMonths={1}
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
                placeholder="From date"
                value={moment(state.from || DEFAULT_FROM_DATE).format(
                  "YYYY-MM-DD"
                )}
                onChange={event => {
                  setState({
                    ...state,
                    from: new Date(event.currentTarget.value)
                  });
                }}
              />
            </div>
            <div>
              <label htmlFor="to">To</label>
              <input
                id="to"
                type="date"
                placeholder="To date"
                value={moment(state.to || DEFAULT_TO_DATE).format("YYYY-MM-DD")}
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
                <XCircle /> Cancel
              </button>
              <button
                type="submit"
                disabled={!state.from || !state.to}
                onClick={() => {
                  onBlur();
                  onChange(state.from, state.to);
                }}
              >
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
