import React from 'react';

function ProgressBar({ percentage, filledWeeksCount, totalWeeks }) {
    if (totalWeeks <= 0) {
        return null;
    }

    return (
        <div className="progress-section">
            <div className="progress-bar-container">
                <div
                    className="progress-bar-filled"
                    style={{ width: `${percentage}%` }}
                ></div>
                <span className="progress-bar-text">
                    {percentage.toFixed(1)}%
                </span>
            </div>
            <p className="progress-label">
                {filledWeeksCount} de {totalWeeks} semanas preenchidas
            </p>
        </div>
    );
}

export default ProgressBar;