import { useState } from 'react';
import { ReviewIncident } from './types/report';
import { incidents as seedIncidents } from './data/incidents';
import { AppShell } from './components/AppShell';
import { Toaster } from './components/ui/sonner';

export function App() {
  const [incidents, setIncidents] = useState<ReviewIncident[]>(seedIncidents);
  const [resolvedHelp, setResolvedHelp] = useState<string[]>([]);

  const updateIncident = (
  id: string,
  updater: (incident: ReviewIncident) => ReviewIncident) =>
  {
    setIncidents((prev) =>
    prev.map((incident) => incident.id === id ? updater(incident) : incident)
    );
  };

  return (
    <>
      <AppShell
        incidents={incidents}
        onUpdateIncident={updateIncident}
        onAddIncident={(incident) => setIncidents((prev) => [...prev, incident])}
        resolvedHelp={resolvedHelp}
        onResolveHelp={(helpId) => setResolvedHelp((prev) => [...prev, helpId])} />

      <Toaster />
    </>);

}