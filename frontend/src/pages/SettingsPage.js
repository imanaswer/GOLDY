import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings configuration coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
