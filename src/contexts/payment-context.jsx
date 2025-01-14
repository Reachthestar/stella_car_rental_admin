import { createContext, useContext, useEffect, useState } from 'react';
import paymentApi from '../apis/payment';
import dayjs from 'dayjs';

const PaymentContext = createContext();

export default function PaymentContextProvider({ children }) {
  const [allPayment, setAllPayment] = useState();
  const [isAllPaymentLoading, setIsAllPaymentLoading] = useState(true);
  const [monthlyPayments, setMonthlyPayments] = useState(null);
  const [allPaymentComplete, setAllPaymentComplete] = useState(null);
  const [yearlyPayment, setYearlyPayment] = useState(null);
  const [dailyPayment, setDailyPayment] = useState(null);
  const [totalPaymentPerMonth , setTotalPaymentPerMonth] = useState(null)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const fetchPayment = async () => {
    try {
      const paymentRes = await paymentApi.getAllPayment();
      const data = paymentRes.data.message.reduce((acc, item) => {
        const paymentData = {
          bookingId: item.bookingId,
          paymentId: item.paymentId,
          customer: item.Booking.Customer.firstName + ' ' + item.Booking.Customer.lastName,
          paymentDate: item.paymentDate,
          amount: item.amount,
          status: item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1),
          createdAt: item.createdAt,
        };
        acc.push(paymentData);
        return acc;
      }, []);

      setAllPayment(data.sort((a, b) => b.bookingId - a.bookingId));
      setAllPaymentComplete(data.filter((item) => item.status === 'Complete'));

      const totalPaymentPerMonth = data.reduce((acc, item) => {
          const month = new Date(item.paymentDate).getMonth();
          acc[month] = (acc[month] || 0) + item.amount;
          return acc;
        },
        Array(12).fill(0)
      );
      setTotalPaymentPerMonth(totalPaymentPerMonth);

      // Filter data for current month
      const currentMonthData = data.filter((item) => {
        const date = new Date(item.createdAt);
        return (
          date.getMonth() + 1 === currentMonth &&
          date.getFullYear() === currentYear
        );
      });

      // Generate a list of all days in the current month
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dailyPaymentsMap = {};

      // สร้าง obj ที่มี key เป็นแต่ละวันของ currentMonth ให้ค่าเริ่มต้นของแต่ละวัน = 0
      for (let i = 1; i <= daysInMonth; i++) {
        const day = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        dailyPaymentsMap[day] = 0;
      }

      // Calculate daily payments for current month
      currentMonthData.forEach((item) => {
        const date = dayjs(item.createdAt).format('YYYY-MM-DD'); // assuming item.createdAt is already in YYYY-MM-DD format
        if (dailyPaymentsMap[date] !== undefined) {
          dailyPaymentsMap[date] += item.amount;
        }
      });

      // Transform dailyPaymentsMap object into an array
      const dailyPaymentsArray = Object.keys(dailyPaymentsMap).map((date) => ({
        date,
        totalAmount: dailyPaymentsMap[date],
      }));
      setDailyPayment(dailyPaymentsArray);

      setYearlyPayment(
        data.filter(
          (item) => parseInt(item.createdAt.split('-')[0]) === currentYear
        )
      );
      setMonthlyPayments(
        data.filter(
          (item) => parseInt(item.createdAt.split('-')[1]) === currentMonth
        )
      );

    } catch (error) {
      console.log(error);
    } finally {
      setIsAllPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        allPayment,
        isAllPaymentLoading,
        monthlyPayments,
        allPaymentComplete,
        fetchPayment,
        yearlyPayment,
        dailyPayment,
        totalPaymentPerMonth,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  return useContext(PaymentContext);
}
