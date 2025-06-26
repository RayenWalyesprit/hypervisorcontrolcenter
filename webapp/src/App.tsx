// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Tickets from './pages/Tickets';
import Login from './pages/Login';
import PrivateRoute from './components/routing/PrivateRoute';
import Parameters from './pages/Parameters';
import VmDetails from './pages/VmDetails';
import AddUserForm from './pages/AddUserForm';
import AdminUsers from './pages/AdminUsers';
import CentralDashboard from './pages/CentralDashboard'

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/vm/:vmIp/details" element={
          <PrivateRoute>
            <Layout>
              <VmDetails />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/tickets" element={
          <PrivateRoute>
            <Layout>
              <Tickets />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/CentralDashboard" element={            <Layout>
              <CentralDashboard />
            </Layout>} />

        <Route path="/alerts" element={
          <PrivateRoute>
            <Layout>
              <Alerts />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/parameters" element={
          <PrivateRoute>
            <Layout>
              <Parameters />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin/add-user" element={
         
            <Layout>
              <AddUserForm />
            </Layout>
        
        } />
      <Route
  path="/admin/users"
  element={
    <PrivateRoute>
      <Layout>
        <AdminUsers />
      </Layout>
    </PrivateRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
