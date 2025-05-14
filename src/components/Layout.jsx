import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        <div className={`md:hidden fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} onClick={() => setSidebarOpen(false)}></div>
        
        {/* Sidebar - hidden by default on mobile */}
        <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 bg-white shadow-md flex flex-col md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
  
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };

export default Layout;