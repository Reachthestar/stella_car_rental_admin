import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import { useBooking } from '../../../contexts/booking-context';
import dayjs from 'dayjs';
import Header from '../../../components/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PopularCars() {
  const { popularCarsMonthly, popularCarsYearly, currentYear } = useBooking();
  const [selectCategory, setSelectCategory] = useState('monthly');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const scrollRef = useRef()

  const handleCategoryChange = (event) => {
    setSelectCategory(event.target.value);
    if(scrollRef.current) {
      scrollRef.current.scrollTo({
        top : 0,
        behavior : 'smooth'
      })
    }
  };

  useEffect(() => {
    let labels = [];
    let data = [];

    if (selectCategory === 'yearly') {
      labels = popularCarsYearly.map((item) => item.car);
      data = popularCarsYearly.map((item) => item.count);
    } else if (selectCategory === 'monthly') {
      labels = popularCarsMonthly.map((item) => item.car);
      data = popularCarsMonthly.map((item) => item.count);
    }

    setChartData({
      labels,
      datasets: [
        {
          label:
            selectCategory === 'yearly'
              ? `Popular Cars (${currentYear})`
              : `Popular Cars (${dayjs().format('MMM')})`,
          data,
          backgroundColor: 'rgba(53, 162, 235, 0.8)',
          borderRadius: 5,
        },
      ],
    });
  }, [selectCategory, popularCarsMonthly, popularCarsYearly, currentYear]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text:
          selectCategory === 'yearly'
            ? `Yearly Popular Cars (${currentYear})`
            : `Monthly Popular Cars (${dayjs().format('MMM')})`,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const sortedData =
    selectCategory === 'yearly'
      ? [...popularCarsYearly].sort((a, b) => b.count - a.count)
      : [...popularCarsMonthly].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-3 border border-gray-300 rounded-md p-3">
      <div className="flex flex-col gap-3 bg-card-04-bg rounded-md shadow-md p-4">
        <h1 className="text-center text-2xl text-white font-semibold">
          Popular Cars
        </h1>

        <form>
          <select
            name="category"
            id="categorySelect"
            className="w-full border bg-gray-100 rounded-md py-1.5 px-2 focus:outline-none"
            onChange={handleCategoryChange}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </form>
      </div>

      <div className="flex flex-col gap-4 h-[400px] overflow-auto" ref={scrollRef}>
        <Header
        columns={[
          'No.',
          'Car',
          'Count',
        ]}
        />
        {sortedData?.map((booking, index) => (
          <div key={index} className="bg-white rounded-lg p-5 shadow-md w-full">
            <div className="grid grid-cols-3 text-center">
              <div className="p-2 break-words">{index + 1}</div>
              <div className="p-2 break-words">{booking?.car}</div>
              <div className="p-2 break-words">{booking?.count}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-md shadow-md p-4 w-full flex justify-center">
        <div style={{ width: '700px', height: '350px' }}>
          <Bar options={options} data={chartData} />
        </div>
      </div>
    </div>
  );
}
