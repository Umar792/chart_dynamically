import React, { useState } from "react";
import "../Style/Content.css";
import { useSelector } from "react-redux";
import { AiFillBank, AiFillFolder } from "react-icons/ai";
import { GrUnorderedList } from "react-icons/gr";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment'; // Import moment.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);


const Content = () => {
  const user = useSelector((state) => state.user.user);
  const loading = useSelector((state) => state.user.loading);
  const allProduct = useSelector((state) => state.product.allProduct);
  const allorder = useSelector((state)=> state.order.allorder)

  const totalAmount = allorder?.reduce((total, product) => {
    return total + product.NetAmount;
  }, 0);
  

  return (
    <>
      {loading ? (
        <loading />
      ) : (
        <>
          <div className="dash_main_header">
            <div>
              <div className="dash_main_header_box inner_box1">
                <AiFillFolder />
               <div className="inner_box ">
               <h2>Total Products</h2>
                <span>{allProduct?.length}</span>
               </div>
              </div>
            </div>
            <div className="dash_main_header_box inner_box2">
              <GrUnorderedList />
              <div className="inner_box ">
                <h2>Total Orders</h2>

                <span>{allorder?.length}</span>
              </div>
            </div>
            <div className="dash_main_header_box inner_box3">
              <AiFillBank />
              <div className="inner_box ">
                <h2>Total Income</h2>
                <span>{totalAmount && totalAmount}$</span>
              </div>
            </div>

          </div>
          {/* ======  */}
          <div className="flex justify-between place-items-center gap-[20px]">
          <LineChart/>
          <PaymentChart/>
          </div>
        </>
      )}
    </>
  );
};

export default Content;







// ====================================================

const LineChart = () => {
  const allorder = useSelector((state) => [...state.order.allorder].reverse());
  const [selectedInterval, setSelectedInterval] = useState("month"); // Initialize with "month"
  // Calculate the current year and create an array of 12 months for the current year
  const currentYear = moment().format("YYYY");
  const currentMonth = moment().format("MMMM");
  const twelveMonths = [];
  for (let i = 0; i < 12; i++) {
    twelveMonths.push(`${currentYear}-${(i + 1).toString().padStart(2, "0")}`);
  }

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Orders",
        },
        beginAtZero: true,
      },
    },
  };

  // Function to group orders by the selected time interval
  const groupOrdersByInterval = (interval) => {
    const groupedData = {};
  
    allorder.forEach((order) => {
      const timestamp = moment(order.created_at);
    
      if (interval === "month") {
        const intervalKey = timestamp.format("YYYY-MM");
        groupedData[intervalKey] = (groupedData[intervalKey] || 0) + 1;
      } else if (interval === "week") {
        const startOfMonth = moment(timestamp).startOf('month');
        const endOfMonth = moment(timestamp).endOf('month');
        let currentDate = startOfMonth.clone();
        let weekNumber = 1;
  
        while (currentDate.isSameOrBefore(endOfMonth)) {
          const weekStart = currentDate.clone();
          const weekEnd = currentDate.clone().endOf('week');
          const weekLabel = `${timestamp.format("MMMM")} - Week ${weekNumber}`;
          if (!(weekLabel in groupedData)) {
            groupedData[weekLabel] = 0;
          }
          const orderDate = moment(order.created_at);
  
          // Check if the order date is in the same week
          if (orderDate.isBetween(weekStart, weekEnd, null, '[]')) {
            groupedData[weekLabel]++;
          }
          currentDate.add(1, 'week');
          weekNumber++;
        }
      } else if (interval === "day") {
        const today = moment();
        const last7Days = [0, 1, 2, 3, 4, 5, 6].map((i) =>
        today.clone().subtract(i, 'days').format('YYYY-MM-DD')
      ).reverse();
  
      // Initialize data for all last 7 days, even if no orders exist
      last7Days.forEach((day) => {
        groupedData[day] = groupedData[day] || 0;
      });  
        const orderDate = timestamp.format('YYYY-MM-DD');

      if (last7Days.includes(orderDate)) {
        groupedData[orderDate]++;
      }
    }
  });

  return groupedData;
  };
  

  // Function to handle interval change when the user selects a different interval
  const handleIntervalChange = (newInterval) => {
    setSelectedInterval(newInterval);
  };

  const intervals = ["month", "week", "day"];

  const dataByInterval = groupOrdersByInterval(selectedInterval);

  // Calculate the labels for weeks
const labels = selectedInterval === "month" ? twelveMonths : Object.keys(dataByInterval);

  const orderCounts = labels.map((label) => {
    if (selectedInterval === 'day') {
      const dayData = dataByInterval[label];
      return dayData || 0;
    }
    return dataByInterval[label] || [0];
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Number of Orders',
        data: orderCounts.flat(),
        backgroundColor: '#6E6EEF',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-[100%] mx-[20px] my-[20px]">
      <h2 className="text-[22px] font-bold mb-2">
        Total Orders by {selectedInterval.charAt(0).toUpperCase() + selectedInterval.slice(1)}
      </h2>

      <div>
        <label>Select Interval: </label>
        <select
          value={selectedInterval}
          onChange={(e) => handleIntervalChange(e.target.value)}
        >
          {intervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval.charAt(0).toUpperCase() + interval.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Bar options={options} data={data} />
    </div>
  );
};

// ====================
// ========= 

const PaymentChart = () => {
  const paymentData = useSelector((state) => [...state.order.allorder].reverse());
  const [selectedInterval, setSelectedInterval] = useState("month");

  const currentYear = moment().format("YYYY");
  const twelveMonths = [];
  for (let i = 0; i < 12; i++) {
    twelveMonths.push(`${currentYear}-${(i + 1).toString().padStart(2, "0")}`);
  }

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Net Amount",
        },
        beginAtZero: true,
      },
    },
  };

  const groupPaymentsByInterval = (interval) => {
    const groupedData = {};

    paymentData.forEach((payment) => {
      const timestamp = moment(payment.created_at);

      if (interval === "month") {
        const intervalKey = timestamp.format("YYYY-MM");
        groupedData[intervalKey] = (groupedData[intervalKey] || 0) + payment.NetAmount;
      } else if (interval === "week") {
        const startOfMonth = moment(timestamp).startOf('month');
        const endOfMonth = moment(timestamp).endOf('month');
        let currentDate = startOfMonth.clone();
        let weekNumber = 1;
      
        while (currentDate.isSameOrBefore(endOfMonth)) {
          const weekStart = currentDate.clone();
          const weekEnd = currentDate.clone().endOf('week');
          const weekLabel = `${timestamp.format("MMMM")} - Week ${weekNumber}`;
          if (!(weekLabel in groupedData)) {
            groupedData[weekLabel] = 0;
          }
          const paymentDate = moment(payment.created_at);
      
          // Check if the payment date is in the same week
          if (paymentDate.isBetween(weekStart, weekEnd, null, '[]')) {
            groupedData[weekLabel] += payment.NetAmount;
          }
          currentDate.add(1, 'week');
          weekNumber++;
        }
      } 
      
      else if (interval === "day") {
        const today = moment();
        const last7Days = [0, 1, 2, 3, 4, 5, 6].map((i) =>
          today.clone().subtract(i, 'days').format('YYYY-MM-DD')
        ).reverse();
      
        // Initialize data for all last 7 days, even if no payments exist
        last7Days.forEach((day) => {
          groupedData[day] = 0; // Initialize to 0 for all days
        });
      
        paymentData.forEach((payment) => {
          const timestamp = moment(payment.created_at);
          const paymentDate = timestamp.format('YYYY-MM-DD');
          
          if (last7Days.includes(paymentDate)) {
            groupedData[paymentDate] += payment.NetAmount; // Accumulate NetAmount for each day
          }
        });
      }
    });

    return groupedData;
  };

  const handleIntervalChange = (newInterval) => {
    setSelectedInterval(newInterval);
  };

  const intervals = ["month", "week", "day"];

  const dataByInterval = groupPaymentsByInterval(selectedInterval);

  let labels = selectedInterval === 'month' ? twelveMonths : Object.keys(dataByInterval);

  const orderCounts = labels.map((label) => {
    if (selectedInterval === 'day') {
      const dayData = dataByInterval[label] ;
      return dayData || 0;
    }
    return dataByInterval[label]  || [0];
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Net Amount In USD',
        data: orderCounts.flat(),
        borderColor: '#6E6EEF',
        borderWidth: 2,
        fill: false, // Line chart should not be filled
      },
    ],
  };

  return (
    <div className="w-[100%] mx-[20px] my-[20px]">
      <h2 className="text-[22px] font-bold mb-2">
        Total Net Amount by {selectedInterval.charAt(0).toUpperCase() + selectedInterval.slice(1)}
      </h2>

      <div>
        <label>Select Interval: </label>
        <select
          value={selectedInterval}
          onChange={(e) => handleIntervalChange(e.target.value)}
        >
          {intervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval.charAt(0).toUpperCase() + interval.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Line options={options} data={data} />
    </div>
  );
};
