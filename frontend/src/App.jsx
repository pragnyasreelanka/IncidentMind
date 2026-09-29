import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "Database",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`);

      if (!response.ok) {
        throw new Error("Failed to fetch incidents");
      }

      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to IncidentMind backend.");
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Please enter both title and description.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create incident");
      }

      setMessage("Incident analyzed successfully.");

      setForm({
        title: "",
        description: "",
        severity: "medium",
        category: "Database",
      });

      await fetchIncidents();

      setSelectedIncident(data);
      setActivePage("incidents");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewIncident = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/incidents/${id}`);

      if (!response.ok) {
        throw new Error("Incident not found");
      }

      const data = await response.json();
      setSelectedIncident(data);
      setActivePage("incidents");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const stats = useMemo(() => {
    return {
      total: incidents.length,
      open: incidents.filter((i) => i.status === "open").length,
      high: incidents.filter(
        (i) => i.severity === "high"
      ).length,
      critical: incidents.filter(
        (i) => i.severity === "critical"
      ).length,
    };
  }, [incidents]);

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Incident Dashboard</h2>
          <p className="subheading">
            Monitor incidents and generate AI-powered response insights.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setActivePage("create")}
        >
          + New Incident
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">◈</div>
          <div>
            <span>Total Incidents</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span>Open Incidents</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">!</div>
          <div>
            <span>High Severity</span>
            <strong>{stats.high}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">⚠</div>
          <div>
            <span>Critical</span>
            <strong>{stats.critical}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h3>Recent Incidents</h3>
            </div>

            <button
              className="text-button"
              onClick={() => setActivePage("incidents")}
            >
              View all →
            </button>
          </div>

          {incidents.length === 0 ? (
            <div className="empty-state">
              <div>◎</div>
              <p>No incidents have been created yet.</p>
            </div>
          ) : (
            <div className="incident-table">
              {incidents.slice(0, 5).map((incident) => (
                <div
                  className="table-row"
                  key={incident.id}
                  onClick={() => viewIncident(incident.id)}
                >
                  <div className="incident-title">
                    <div className="incident-number">
                      #{incident.id}
                    </div>
                    <div>
                      <strong>{incident.title}</strong>
                      <span>
                        {incident.category || "General"}
                      </span>
                    </div>
                  </div>

                  <span className={`severity ${incident.severity}`}>
                    {incident.severity}
                  </span>

                  <span className="status">
                    {incident.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel memory-panel">
          <div className="memory-icon">🧠</div>
          <p className="eyebrow">AI MEMORY</p>
          <h3>Learn from every incident.</h3>
          <p>
            IncidentMind uses historical incident knowledge to
            provide context-aware AI recommendations for new
            incidents.
          </p>

          <div className="memory-flow">
            <span>Current Incident</span>
            <b>→</b>
            <span>Hindsight Memory</span>
            <b>→</b>
            <span>Groq AI</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderCreate = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">INCIDENT MANAGEMENT</p>
          <h2>Create New Incident</h2>
          <p className="subheading">
            Describe the incident and let IncidentMind analyze it
            using historical knowledge.
          </p>
        </div>
      </div>

      <div className="create-layout">
        <div className="panel form-panel">
          <form onSubmit={handleSubmit}>
            <label>Incident Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Production Database Outage"
              value={form.title}
              onChange={handleChange}
            />

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe what happened, affected services, symptoms, etc."
              value={form.description}
              onChange={handleChange}
              rows="7"
            />

            <div className="form-grid">
              <div>
                <label>Severity</label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Database">Database</option>
                  <option value="Network">Network</option>
                  <option value="Application">Application</option>
                  <option value="Security">Security</option>
                  <option value="Infrastructure">
                    Infrastructure
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="analyze-button"
              disabled={loading}
            >
              {loading
                ? "Analyzing Incident..."
                : "✦ Create & Analyze Incident"}
            </button>
          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>

        <div className="panel how-panel">
          <div className="memory-icon">🧠</div>
          <h3>How IncidentMind works</h3>

          <div className="workflow-step">
            <span>01</span>
            <div>
              <strong>Store incident</strong>
              <p>The incident is saved in SQLite.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>02</span>
            <div>
              <strong>Recall history</strong>
              <p>Hindsight searches for similar incidents.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>03</span>
            <div>
              <strong>AI analysis</strong>
              <p>Groq analyzes the incident with historical context.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>04</span>
            <div>
              <strong>Learn</strong>
              <p>The new incident becomes future memory.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderIncidents = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HISTORY</p>
          <h2>Incident History</h2>
          <p className="subheading">
            Browse incidents and inspect their AI-generated analysis.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchIncidents}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="panel">
        {incidents.length === 0 ? (
          <div className="empty-state">
            <div>◎</div>
            <p>No incidents found.</p>
          </div>
        ) : (
          <div className="full-incident-list">
            {incidents.map((incident) => (
              <div
                className={`full-incident ${
                  selectedIncident?.id === incident.id
                    ? "selected"
                    : ""
                }`}
                key={incident.id}
                onClick={() => viewIncident(incident.id)}
              >
                <div className="incident-number">
                  #{incident.id}
                </div>

                <div className="full-incident-main">
                  <h3>{incident.title}</h3>
                  <p>{incident.description}</p>

                  <div className="incident-tags">
                    <span>{incident.category || "General"}</span>
                    <span>{incident.status}</span>
                  </div>
                </div>

                <span className={`severity ${incident.severity}`}>
                  {incident.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIncident && renderAnalysis()}
    </>
  );

  const renderAnalysis = () => (
    <div className="panel analysis-panel">
      <div className="analysis-header">
        <div>
          <p className="eyebrow">AI ANALYSIS</p>
          <h2>{selectedIncident.title}</h2>
          <p>Incident #{selectedIncident.id}</p>
        </div>

        <div className="analysis-actions">
          <span className={`severity ${selectedIncident.severity}`}>
            {selectedIncident.severity}
          </span>

          <button
            className="secondary-button"
            onClick={() => setSelectedIncident(null)}
          >
            Close
          </button>
        </div>
      </div>

      <div className="incident-description">
        <strong>Incident Description</strong>
        <p>{selectedIncident.description}</p>
      </div>

      <div className="ai-banner">
        <div className="ai-banner-icon">✦</div>
        <div>
          <strong>Memory-Aware AI Analysis</strong>
          <p>
            This analysis uses historical incident knowledge
            retrieved from Hindsight.
          </p>
        </div>
      </div>

      <div className="analysis-content">
        {selectedIncident.ai_analysis ? (
          <pre>{selectedIncident.ai_analysis}</pre>
        ) : (
          <p>No AI analysis available.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🧠</div>
          <div>
            <h1>IncidentMind</h1>
            <span>AI Incident Intelligence</span>
          </div>
        </div>

        <nav>
          <p className="nav-label">WORKSPACE</p>

          <button
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => {
              setActivePage("dashboard");
              setSelectedIncident(null);
            }}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={activePage === "incidents" ? "active" : ""}
            onClick={() => setActivePage("incidents")}
          >
            <span>◉</span>
            Incidents
            <small>{incidents.length}</small>
          </button>

          <button
            className={activePage === "create" ? "active" : ""}
            onClick={() => setActivePage("create")}
          >
            <span>＋</span>
            New Incident
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="online-dot"></span>
            <div>
              <strong>System Online</strong>
              <span>API connected</span>
            </div>
          </div>

          <div className="stack-info">
            <span>React</span>
            <span>FastAPI</span>
            <span>Hindsight</span>
            <span>Groq</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span>Incident Management</span>
          </div>

          <div className="topbar-status">
            <span className="online-dot"></span>
            Backend Connected
          </div>
        </header>

        <div className="content">
          {activePage === "dashboard" && renderDashboard()}
          {activePage === "create" && renderCreate()}
          {activePage === "incidents" && renderIncidents()}
        </div>

        <footer>
          IncidentMind · AI + FastAPI + SQLite + Hindsight
        </footer>
      </main>
    </div>
  );
}

export default App;