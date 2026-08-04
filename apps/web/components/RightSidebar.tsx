"use client";

import Link from "next/link";
import { Icon } from "./ui/Icon";

export function RightSidebar() {
  return (
    <aside className="lb-right-sidebar" aria-label="Contextual Widgets & Local Info">
      {/* Widget 1: Weather Now */}
      <div className="sidebar-card weather-widget-card">
        <div className="card-header-row">
          <h3 className="card-title-text">Weather Now</h3>
          <span className="location-pin-text">
            <Icon name="pin" size={13} /> Guwahati, Assam
          </span>
        </div>

        <div className="weather-main-row">
          <div className="temp-block">
            <span className="current-temp">26°C</span>
            <div className="temp-sub">
              <span className="weather-cond">Cloudy</span>
              <span className="feels-like">Feels like 28°C</span>
            </div>
          </div>
          <div className="weather-icon-illustration">
            <Icon name="cloud" size={44} className="text-teal" />
          </div>
        </div>

        <div className="weather-metrics-row">
          <div className="metric-item">
            <Icon name="droplet" size={14} />
            <span>72%</span>
            <small>Humidity</small>
          </div>
          <div className="metric-item">
            <Icon name="cloud" size={14} />
            <span>8 km/h</span>
            <small>Wind</small>
          </div>
          <div className="metric-item">
            <Icon name="alert" size={14} />
            <span>1012 hPa</span>
            <small>Pressure</small>
          </div>
        </div>

        <div className="forecast-mini-row">
          <div className="forecast-day">
            <span>Sat</span>
            <Icon name="cloud" size={16} />
            <strong>31° / 25°</strong>
          </div>
          <div className="forecast-day">
            <span>Sun</span>
            <Icon name="sun" size={16} />
            <strong>30° / 25°</strong>
          </div>
          <div className="forecast-day">
            <span>Mon</span>
            <Icon name="cloud" size={16} />
            <strong>29° / 25°</strong>
          </div>
          <div className="forecast-day">
            <span>Tue</span>
            <Icon name="cloud" size={16} />
            <strong>31° / 26°</strong>
          </div>
        </div>

        <Link href="/weather" className="card-footer-link">
          <span>View full forecast</span>
          <Icon name="chevron-right" size={14} />
        </Link>
      </div>

      {/* Widget 2: Quick Services */}
      <div className="sidebar-card quick-services-card">
        <div className="card-header-row">
          <h3 className="card-title-text">Quick Services</h3>
          <Link href="/services" className="header-link-sm">
            View All
          </Link>
        </div>

        <div className="services-icon-grid">
          <Link href="/services?type=telemedicine" className="service-grid-tile">
            <div className="service-tile-icon bg-info">
              <Icon name="hospital" size={20} />
            </div>
            <span className="service-tile-label">Telemedicine</span>
          </Link>
          <Link href="/services?type=ambulance" className="service-grid-tile">
            <div className="service-tile-icon bg-danger">
              <Icon name="ambulance" size={20} />
            </div>
            <span className="service-tile-label">Ambulance</span>
          </Link>
          <Link href="/services?type=blood" className="service-grid-tile">
            <div className="service-tile-icon bg-red">
              <Icon name="droplet" size={20} />
            </div>
            <span className="service-tile-label">Blood Donor</span>
          </Link>
          <Link href="/services?type=shelter" className="service-grid-tile">
            <div className="service-tile-icon bg-teal">
              <Icon name="services" size={20} />
            </div>
            <span className="service-tile-label">Nearby Shelter</span>
          </Link>
        </div>
      </div>

      {/* Widget 3: Stay Safe */}
      <div className="sidebar-card stay-safe-card">
        <div className="safe-card-body">
          <div className="safe-text-block">
            <h3 className="safe-card-title">Stay Safe</h3>
            <p className="safe-card-desc">
              Share your location with trusted contacts in emergencies.
            </p>
            <button
              type="button"
              className="btn-share-location"
              onClick={() => alert("Location shared with your designated emergency contacts.")}
            >
              Share Location
            </button>
          </div>
          <div className="safe-card-illustration">
            <Icon name="shield" size={48} className="text-teal" />
          </div>
        </div>
      </div>

      {/* Widget 4: Daily Tip */}
      <div className="sidebar-card daily-tip-card">
        <div className="tip-card-body">
          <span className="tip-quote-mark">“</span>
          <div className="tip-text-block">
            <h3 className="tip-title">Daily Tip</h3>
            <p className="tip-desc">
              Stay informed, stay prepared, stay safe. Small actions save lives.
            </p>
          </div>
          <div className="tip-illustration">
            <Icon name="check" size={32} className="text-success" />
          </div>
        </div>
      </div>
    </aside>
  );
}

