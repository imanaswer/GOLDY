import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users as UsersIcon } from 'lucide-react';

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    party_type: 'customer',
    notes: ''
  });

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const response = await axios.get(`${API}/parties`);
      setParties(response.data);
    } catch (error) {
      toast.error('Failed to load parties');
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/parties`, formData);
      toast.success('Party created successfully');
      setShowDialog(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        party_type: 'customer',
        notes: ''
      });
      loadParties();
    } catch (error) {
      toast.error('Failed to create party');
    }
  };

  return (
    <div data-testid="parties-page">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-2">Parties</h1>
          <p className="text-muted-foreground">Manage customers and vendors</p>
        </div>
        <Button data-testid="add-party-button" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Party
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">All Parties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="parties-table">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Address</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{party.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{party.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        party.party_type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {party.party_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{party.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                data-testid="party-name-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                data-testid="party-phone-input"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.party_type} onValueChange={(val) => setFormData({...formData, party_type: val})}>
                <SelectTrigger data-testid="party-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <Button data-testid="save-party-button" onClick={handleCreate} className="w-full">Save Party</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
