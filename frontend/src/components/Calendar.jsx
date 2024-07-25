import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Space } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const convertToMomentArray = (dateStrings) => {
  const moments = dateStrings.map(dateString => moment(dateString));
  console.log("Converted moments:", moments);
  return moments;
};

const Calendar = (props) => {
  const { onChange, dates, setDates } = props;
  const [open, setOpen] = useState(false);

  const handleChange = (inputDates) => {
    setDates(inputDates);
    console.log("inputDates", inputDates);
  };

  const handleOpenChange = (open) => {
    setOpen(open);
  };

  const handleClickSave = () => {
      setOpen(!open);
  }
  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical">
        <Button type="primary" onClick={handleClickSave}>
          {dates?.length ? `Selected: ${dates[0].format('YYYY-MM-DD')} - ${dates[1].format('YYYY-MM-DD')}` : 'Select Date Range'}
        </Button>
        {open && (
          <RangePicker
            open={open}
            onChange={handleChange}
            onOpenChange={handleOpenChange}
            value={dates}
            renderExtraFooter={() => 'Select a date range'}
            format="YYYY-MM-DD"
          />
        )}
      </Space>
    </div>
  );
};

export default Calendar;