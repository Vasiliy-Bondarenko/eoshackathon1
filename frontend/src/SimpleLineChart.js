import React from 'react';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import LineChart from 'recharts/lib/chart/LineChart';
import Line from 'recharts/lib/cartesian/Line';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import Legend from 'recharts/lib/component/Legend';

const data = [
  { name: 'Jan', Visits: 200, Reviews: 180 },
  { name: 'Feb', Visits: 180, Reviews: 100 },
  { name: 'Mar', Visits: 500, Reviews: 400 },
  { name: 'Apr', Visits: 478, Reviews: 298 },
  { name: 'May', Visits: 590, Reviews: 480 },
  { name: 'Jun', Visits: 430, Reviews: 380 },
  { name: 'Jul', Visits: 449, Reviews: 430 },
  { name: 'Aug', Visits: 890, Reviews: 623 },
];

function SimpleLineChart() {
  return (
    // 99% per https://github.com/recharts/recharts/issues/172
    <ResponsiveContainer width="99%" height={320}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Visits" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Reviews" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SimpleLineChart;
