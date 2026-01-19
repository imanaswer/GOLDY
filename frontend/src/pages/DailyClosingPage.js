import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function DailyClosingPage() {
  return (
    <div data-testid="daily-closing-page">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Daily Closing</h1>
        <p className="text-muted-foreground">Daily cash reconciliation and closing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Daily Closing Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Daily closing feature coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
