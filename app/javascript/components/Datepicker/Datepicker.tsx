import * as React from "react";
import DayPicker from "react-day-picker";
import format from "date-fns/format";
import fromUnixTime from "date-fns/fromUnixTime";
import subDays from "date-fns/subDays";
import { CSSTransition } from "react-transition-group";

import "./Datepicker.scss";
import "react-day-picker/lib/style.css";

import XCircle from "react-feather/dist/icons/x-circle";
import Calendar from "react-feather/dist/icons/calendar";

import { SearchContext } from "../../providers/SearchProvider";
import useClickOutside from "../../utils/useClickOutside";

const isSelectingFirstDay = (from: Date, to: Date, day: Date) => {
  const isBeforeFirstDay = from && DayPicker.DateUtils.isDayBefore(day, from);
  const isRangeSelected = from && to;
  return !from || isBeforeFirstDay || isRangeSelected;
};

const getUTCDate = (date = new Date()) => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};

const DEFAULT_FROM_DATE = subDays(new Date(), 7);
const DEFAULT_TO_DATE = new Date();

export interface DatePickerProps {
  isOpen: boolean;
  onChange: (from: Date, to: Date) => any;
  onCancel: () => any;
  onBlur: () => any;
}

const parseDate = (date: string | null, defaultDate: Date): Date => {
  if (!date) return defaultDate;
  return fromUnixTime(parseInt(date));
};

const DatePicker: React.FunctionComponent<DatePickerProps> = ({
  onCancel,
  onChange,
  onBlur
}) => {
  const {
    settings: { dateEnd, dateStart }
  } = React.useContext(SearchContext);

  const [state, setState] = React.useState({
    from: parseDate(dateStart, DEFAULT_FROM_DATE),
    to: parseDate(dateEnd, DEFAULT_TO_DATE),
    enteredTo: parseDate(dateEnd, DEFAULT_TO_DATE)
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
        const fromDate = getUTCDate(day);

        setState({
          from: fromDate,
          to: null,
          enteredTo: fromDate
        });
      } else {
        const toDate = getUTCDate(day);

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

  const wrapOnChangeWithDefaults = () => {
    onChange(state.from || DEFAULT_FROM_DATE, state.to || DEFAULT_TO_DATE);
  };

  const { from, enteredTo } = state;
  const modifiers = { start: from, end: enteredTo };
  const disabledDays = { after: new Date() };
  const selectedDays = [from, { from, to: enteredTo }];
  const datePickerRef = React.useRef(null);
  useClickOutside(datePickerRef, () => onBlur());

  return (
    <CSSTransition
      appear={true}
      classNames="DatepickerAnimation"
      in={true}
      timeout={0}
    >
      <div className="DatePicker" ref={datePickerRef}>
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
                  value={format(state.from || DEFAULT_FROM_DATE, "yyyy-MM-dd")}
                  onChange={({ currentTarget: { value } }) => {
                    setState({
                      ...state,
                      from: value ? new Date(value) : null
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
                  value={format(state.to || DEFAULT_TO_DATE, "yyyy-MM-dd")}
                  onChange={({ currentTarget: { value } }) => {
                    setState({
                      ...state,
                      to: value ? new Date(value) : null
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
                  disabled={!state.from}
                  onClick={() => {
                    onBlur();
                    wrapOnChangeWithDefaults();
                  }}
                >
                  Apply
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </CSSTransition>
  );
};

export default DatePicker;
