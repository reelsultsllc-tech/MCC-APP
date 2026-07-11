'use client';

import { useState } from 'react';

export interface EstimatedResolutionBadgeProps {
  estimatedDate?: string;
  bureau?: string;
  status?: string;
}

const EstimatedResolutionBadge: React.FC<EstimatedResolutionBadgeProps> = ({
  estimatedDate = '18 de agosto',
  bureau = 'Buró Equifax',
  status = 'Activo',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="slide-in">
      <div className="badge-wrapper">
        <div className="badge-container">
          <div className="badge-card" onClick={() => setIsOpen(!isOpen)}>
            <div className="shimmer-overlay" />

            <div className="badge-content">
              <div className="icon-container">
                <div className="icon-wrapper">
                  <svg className="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="text-content">
                <p className="label">Resolución Estimada</p>
                <h3 className="date">{estimatedDate}</h3>
                <p className="day">{bureau}</p>
              </div>

              <div className="badge-pill-container">
                <div className="badge-pill">
                  <p className="badge-text">{status}</p>
                </div>
                <svg
                  className={`arrow-icon ${isOpen ? 'open' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <svg className="border-svg">
            <rect
              x="1" y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="16" ry="16"
              fill="none"
              stroke="#7A1E2C"
              strokeWidth="2"
              className="sliding-line"
              pathLength="1"
            />
          </svg>
        </div>

        <div className={`details-section ${isOpen ? 'open' : ''}`}>
          <div className="details-card">
            <div className="details-content">
              <div className="detail-item">
                <h4 className="detail-title">
                  <span className="detail-number">1</span>
                  Tiempo de resolución
                </h4>
                <p className="detail-text">
                  Por ley, los burós tienen 30 días hábiles para investigar y responder a tu disputa.
                </p>
              </div>

              <div className="detail-item">
                <h4 className="detail-title">
                  <span className="detail-number">2</span>
                  Proceso de disputa
                </h4>
                <p className="detail-text">
                  Nuestro equipo supervisa activamente tu caso y te notificará cualquier actualización importante.
                </p>
              </div>

              <div className="detail-item">
                <h4 className="detail-title">
                  <span className="detail-number">3</span>
                  Soporte personalizado
                </h4>
                <p className="detail-text">
                  Si tienes preguntas, contáctanos en <strong style={{ color: '#7A1E2C' }}>support@mycreditcafe.com</strong> y te responderemos en 24h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatedResolutionBadge;
