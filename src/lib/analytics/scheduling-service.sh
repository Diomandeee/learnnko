#!/bin/bash

# Schedule analytics tasks
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/node /app/src/lib/analytics/scheduler.js") | crontab -

# Schedule alert checks
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/node /app/src/lib/analytics/alerts.js") | crontab -

# Schedule report generation
(crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/node /app/src/lib/analytics/reports.js") | crontab -

echo "Analytics scheduling service installed successfully"
