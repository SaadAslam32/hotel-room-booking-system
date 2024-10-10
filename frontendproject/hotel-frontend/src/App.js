import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Signup from './pages/signup';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import AdminRooms from './pages/adminrooms';
import CreateRoom from './pages/createroom';
import EditRoom from './pages/editroom';
import CustomerRooms from './pages/customerrooms';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/mybookings';
import AllBookings from './pages/AllBookings';
import PendingBookings from './pages/PendingBookings';
import DeleteCanceledBookings from './pages/DeleteCanceledBookings';
import PaymentDetails from './pages/PaymentDetails';
import MakePayment from './pages/MakePayment';
import MyPayments from './pages/MyPayments';
import AllPayments from './pages/AllPayments';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms/getall" element={<AdminRooms />} />
          <Route path="/rooms/add" element={<CreateRoom />} />
          <Route path="/edit-room/:id" element={<EditRoom />} />
          <Route path="/rooms/getCustomer" element={<CustomerRooms />} />
          <Route path="/book-room/:room_id" element={<BookRoom />} />
          <Route path="/mybookings" element={<MyBookings />} />
          <Route path="/allbookings" element={<AllBookings />} />
          <Route path="/pendingbookings" element={<PendingBookings />} />
          <Route path="/admin/delete-canceled" element={<DeleteCanceledBookings />} />
          <Route path="/payment-details/:booking_id" element={<PaymentDetails />} />
          <Route path="/make-payment/:id" element={<MakePayment />} />
          <Route path="/mypayments" element={<MyPayments />} />
          <Route path="/allpayments" element={<AllPayments />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;