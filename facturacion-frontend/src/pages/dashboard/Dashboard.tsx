import React from 'react';
import '../../assets/styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>CRM</li>
            <li>Analytics</li>
            <li>Page Layouts</li>
            <li>Widgets</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <div className="metric">
            <h3>$30200</h3>
            <p>All Earnings</p>
          </div>
          <div className="metric">
            <h3>290+</h3>
            <p>Page Views</p>
          </div>
          <div className="metric">
            <h3>145</h3>
            <p>Task Completed</p>
          </div>
          <div className="metric">
            <h3>500</h3>
            <p>Downloads</p>
          </div>
        </header>
        <section className="analytics">
          <h2>Sales Analytics</h2>
          <div className="chart">[Chart Placeholder]</div>
        </section>
        <section className="application-sales">
          <h2>Application Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Sales</th>
                <th>Change</th>
                <th>Avg Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Able Pro</td>
                <td>16,300</td>
                <td>53</td>
                <td>$15,652</td>
                <td>$15,652</td>
              </tr>
              <tr>
                <td>Photoshop</td>
                <td>26,421</td>
                <td>35</td>
                <td>$18,785</td>
                <td>$18,785</td>
              </tr>
              <tr>
                <td>Guruable</td>
                <td>8,265</td>
                <td>98</td>
                <td>$9,652</td>
                <td>$9,652</td>
              </tr>
              <tr>
                <td>Flatable</td>
                <td>10,652</td>
                <td>20</td>
                <td>$7,856</td>
                <td>$7,856</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="user-activity">
          <h2>User Activity</h2>
          <ul>
            <li>
              <p>John Doe</p>
              <p>2 min ago</p>
            </li>
            <li>
              <p>John Doe</p>
              <p>4 min ago</p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
