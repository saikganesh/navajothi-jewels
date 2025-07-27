import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GlobalVariable {
  id: string;
  variable_name: string;
  variable_value: string;
}

const StoreSettings = () => {
  const [variables, setVariables] = useState<GlobalVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase
        .from('globals')
        .select('*')
        .order('variable_name');

      if (error) throw error;
      setVariables(data || []);
    } catch (error) {
      console.error('Error fetching variables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch store settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = (id: string, value: string) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.id === id ? { ...variable, variable_value: value } : variable
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const variable of variables) {
        const { error } = await supabase
          .from('globals')
          .update({ variable_value: variable.variable_value })
          .eq('id', variable.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Store settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating variables:', error);
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatFieldLabel = (variableName: string) => {
    return variableName
      .replace('company_', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-lg">Loading store settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store</h1>
        <p className="text-muted-foreground">
          Manage your store information and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Update your store details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variables.map((variable) => (
            <div key={variable.id} className="space-y-2">
              <Label htmlFor={variable.variable_name}>
                {formatFieldLabel(variable.variable_name)}
              </Label>
              <Input
                id={variable.variable_name}
                value={variable.variable_value}
                onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                placeholder={`Enter ${formatFieldLabel(variable.variable_name).toLowerCase()}`}
              />
            </div>
          ))}
          
          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreSettings;