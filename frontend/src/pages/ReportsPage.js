import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div data-testid="reports-page">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Reports</h1>
        <p className="text-muted-foreground">Generate and export business reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Inventory Summary</h3>
              <p className="text-sm text-muted-foreground">Stock levels by category with value</p>
            </div>
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Fast Moving Items</h3>
              <p className="text-sm text-muted-foreground">Top selling items by period</p>
            </div>
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Outstanding Report</h3>
              <p className="text-sm text-muted-foreground">Customer dues and aging</p>
            </div>
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Sales Summary</h3>
              <p className="text-sm text-muted-foreground">Revenue by period and category</p>
            </div>
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Transaction Report</h3>
              <p className="text-sm text-muted-foreground">Cash flow and payment history</p>
            </div>
            <div className="p-6 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Job Card Report</h3>
              <p className="text-sm text-muted-foreground">Work orders by status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
