import React, { useState, useEffect, useCallback } from 'react';
import { formatWeight, formatCurrency, safeToFixed } from '../utils/numberFormat';
import { API } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package,
  Wallet,
  Banknote,
  Building2,
  ArrowUpDown,
  FileText,
  ShoppingCart,
  Briefcase,
  PenTool,
  Filter,
  X,
  Users,
  BarChart3
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useURLPagination } from '../hooks/useURLPagination';
import { formatDate } from '../utils/dateTimeUtils';

export default function ReportsPage() {
  const { currentPage, setPage, pagination, setPagination } = useURLPagination();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [financialSummary, setFinancialSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states for transactions tab
  const [filters, setFilters] = useState({
    account_id: '',
    account_type: '',
    transaction_type: '',
    reference_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadFinancialSummary();
    loadAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, filters, currentPage]);

  const loadFinancialSummary = async () => {
    try {
      const response = await API.get('/api/reports/financial-summary');
      setFinancialSummary(response.data);
    } catch (error) {
      console.error('Failed to load financial summary');
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await API.get('/api/accounts');
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load accounts');
      setAccounts([]);
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      const params = { page: currentPage, page_size: 10 };
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.account_type) params.account_type = filters.account_type;
      if (filters.transaction_type) params.transaction_type = filters.transaction_type;
      if (filters.reference_type) params.reference_type = filters.reference_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await API.get('/api/transactions', { params });
      setTransactions(response.data.items || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  }, [filters, currentPage, setPagination]);

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const endpoints = {
        inventory: '/api/reports/inventory-export',
        parties: '/api/reports/parties-export',
        invoices: '/api/reports/invoices-export'
      };

      const response = await API.get(endpoints[type], {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      account_id: '',
      account_type: '',
      transaction_type: '',
      reference_type: '',
      start_date: '',
      end_date: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const getTransactionSourceIcon = (source) => {
    switch(source) {
      case 'Invoice Payment': return <FileText className="w-4 h-4" />;
      case 'Purchase Payment': return <ShoppingCart className="w-4 h-4" />;
      case 'Job Card': return <Briefcase className="w-4 h-4" />;
      default: return <PenTool className="w-4 h-4" />;
    }
  };

  return (
    <div data-testid="reports-page">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Ledger-accurate financial reports and comprehensive data analysis</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="overview" data-testid="overview-tab">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" data-testid="transactions-tab">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="sales">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sales History
          </TabsTrigger>
          <TabsTrigger value="outstanding">
            <DollarSign className="w-4 h-4 mr-2" />
            Outstanding
          </TabsTrigger>
          <TabsTrigger value="parties">
            <Users className="w-4 h-4 mr-2" />
            Parties
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" data-testid="overview-content">
          {/* Financial Summary Cards */}
          {financialSummary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card data-testid="total-sales-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.total_sales)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Income account credits</p>
                  </CardContent>
                </Card>

                <Card data-testid="cash-balance-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
                    <Banknote className="w-4 h-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.cash_balance)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Cash asset accounts</p>
                  </CardContent>
                </Card>

                <Card data-testid="bank-balance-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Bank Balance</CardTitle>
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(financialSummary.bank_balance)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Bank asset accounts</p>
                  </CardContent>
                </Card>

                <Card data-testid="net-profit-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                    <DollarSign className="w-4 h-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${financialSummary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialSummary.net_profit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Flow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card data-testid="total-credit-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.total_credit)}</div>
                    <p className="text-xs text-muted-foreground mt-1">All credit transactions</p>
                  </CardContent>
                </Card>

                <Card data-testid="total-debit-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.total_debit)}</div>
                    <p className="text-xs text-muted-foreground mt-1">All debit transactions</p>
                  </CardContent>
                </Card>

                <Card data-testid="net-flow-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Flow</CardTitle>
                    <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${financialSummary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {financialSummary.net_flow >= 0 ? '+' : ''}{formatCurrency(financialSummary.net_flow)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Credit - Debit</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Ledger Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Account Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(financialSummary.total_account_balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Outstanding (Informational)</p>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(financialSummary.total_outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Daily Closing Difference</p>
                      <p className={`text-lg font-bold ${financialSummary.daily_closing_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(financialSummary.daily_closing_difference)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" data-testid="transactions-content">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl font-serif">Transaction Ledger</CardTitle>
                {hasActiveFilters && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Filtered
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-accent' : ''}
              >
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </CardHeader>

            {/* Filter Panel */}
            {showFilters && (
              <div className="px-6 pb-4 border-b bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Account</Label>
                    <Select value={filters.account_id} onValueChange={(val) => setFilters({...filters, account_id: val})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All accounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All accounts</SelectItem>
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Transaction Type</Label>
                    <Select value={filters.transaction_type} onValueChange={(val) => setFilters({...filters, transaction_type: val})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="credit">Credit (Money IN)</SelectItem>
                        <SelectItem value="debit">Debit (Money OUT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Transaction Source</Label>
                    <Select value={filters.reference_type} onValueChange={(val) => setFilters({...filters, reference_type: val})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All sources</SelectItem>
                        <SelectItem value="invoice">Invoice Payment</SelectItem>
                        <SelectItem value="purchase">Purchase Payment</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={filters.start_date}
                      onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={filters.end_date}
                      onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    />
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" /> Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="transactions-table">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">TXN #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Account</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Balance Before</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-sm">{txn.transaction_number}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(txn.date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {txn.transaction_type === 'credit' ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Credit
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Debit
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTransactionSourceIcon(txn.transaction_source)}
                            <span className="text-xs">{txn.transaction_source}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{txn.account_name}</span>
                            <span className="text-xs text-muted-foreground capitalize">{txn.account_type}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${
                          txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {txn.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                          {txn.balance_before ? formatCurrency(txn.balance_before) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                          {txn.balance_after ? formatCurrency(txn.balance_after) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </Card>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export all invoices with payment status and amounts
              </p>
              <Button 
                onClick={() => handleExport('invoices')} 
                disabled={loading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Invoices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SALES HISTORY TAB */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and export historical sales data
              </p>
              <p className="text-xs text-muted-foreground italic">
                Feature available via existing endpoints
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OUTSTANDING TAB */}
        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Outstanding Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View customer and vendor outstanding balances
              </p>
              <p className="text-xs text-muted-foreground italic">
                Feature available via existing endpoints
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARTIES TAB */}
        <TabsContent value="parties">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Users className="w-5 h-5" />
                Parties Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export all customers and vendors with their details
              </p>
              <Button 
                onClick={() => handleExport('parties')} 
                disabled={loading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Parties
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export all inventory movements and stock levels to Excel
              </p>
              <Button 
                onClick={() => handleExport('inventory')} 
                disabled={loading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Inventory
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
