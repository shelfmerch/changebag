import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, MapPin, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchDistributionSettings,
  createCountry,
  createCity,
  createCategory,
  createDistributionPoint,
  updateDistributionPoint,
  deleteDistributionPoint,
  updateCountryStatus,
  updateCityStatus,
  updateCategoryStatus,
  updateCategory,
  updateDistributionPointStatus,
  deleteCountry,
  deleteCity,
  deleteCategory
} from '@/services/distributionService';
import { Country, City, DistributionCategory, DistributionPoint } from '@/types/distribution';

const DistributionSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('countries');
  
  // Filter states
  const [selectedCountryId, setSelectedCountryId] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['distribution-settings'],
    queryFn: fetchDistributionSettings,
  });

  const createCountryMutation = useMutation({
    mutationFn: createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Country created successfully' });
    },
  });

  const createCityMutation = useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'City created successfully' });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Category created successfully' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DistributionCategory> }) =>
      updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Category updated successfully' });
    },
  });

  const createPointMutation = useMutation({
    mutationFn: createDistributionPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Distribution point created successfully' });
    },
  });

  const updatePointMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DistributionPoint> }) =>
      updateDistributionPoint(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Distribution point updated successfully' });
    },
  });

  const deletePointMutation = useMutation({
    mutationFn: deleteDistributionPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Distribution point deleted successfully' });
    },
  });

  const updateCountryStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCountryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Country status updated successfully' });
    },
  });

  const updateCityStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCityStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'City status updated successfully' });
    },
  });

  const updateCategoryStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Category status updated successfully' });
    },
  });

  const updatePointStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDistributionPointStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Distribution point status updated successfully' });
    },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Country deleted successfully' });
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'City deleted successfully' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-settings'] });
      toast({ title: 'Category deleted successfully' });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Distribution Settings" subtitle="Manage countries, cities, categories, and distribution points">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  // Filter cities by selected country
  const filteredCities = settings?.cities.filter(city => 
    selectedCountryId && selectedCountryId !== 'all' ? city.countryId === selectedCountryId : true
  ) || [];

  // Filter distribution points by selected city and category
  const filteredPoints = settings?.points.filter(point => {
    if (selectedCityId && selectedCityId !== 'all' && point.cityId !== selectedCityId) return false;
    if (selectedCategoryId && selectedCategoryId !== 'all' && point.categoryId !== selectedCategoryId) return false;
    return true;
  }) || [];

  const CountriesTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Countries</CardTitle>
        <AddCountryDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Cities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings?.countries.map((country) => (
              <TableRow key={country._id}>
                <TableCell className="font-medium">{country.name}</TableCell>
                <TableCell>{country.code}</TableCell>
                <TableCell>
                  {settings.cities.filter(c => c.countryId === country._id).length}
                </TableCell>
                <TableCell>
                  <Badge variant={country.isActive ? 'default' : 'secondary'}>
                    {country.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCountryMutation.mutate(country._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const CitiesTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cities</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="country-filter">Filter by Country:</Label>
            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {settings?.countries.map((country) => (
                  <SelectItem key={country._id} value={country._id || ''}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AddCityDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Distribution Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.map((city) => (
              <TableRow key={city._id}>
                <TableCell className="font-medium">{city.name}</TableCell>
                <TableCell>
                  {settings?.countries.find(c => c._id === city.countryId)?.name}
                </TableCell>
                <TableCell>{city.state || '-'}</TableCell>
                <TableCell>
                  {settings?.points.filter(p => p.cityId === city._id).length}
                </TableCell>
                <TableCell>
                  <Badge variant={city.isActive ? 'default' : 'secondary'}>
                    {city.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCityMutation.mutate(city._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const CategoriesTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Distribution Categories</CardTitle>
        <AddCategoryDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Default Totes</TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings?.categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${category.color.replace('text-', 'bg-')}`} />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell>
                  <EditableCategoryToteCount 
                    category={category} 
                    onUpdate={(totes) => updateCategoryMutation.mutate({
                      id: category._id!,
                      updates: { defaultToteCount: totes }
                    })}
                  />
                </TableCell>
                <TableCell>
                  {settings?.points.filter(p => p.categoryId === category._id).length}
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategoryMutation.mutate(category._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const DistributionPointsTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Distribution Points</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="city-filter">Filter by City:</Label>
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {settings?.cities.slice(0, 50).map((city) => (
                  <SelectItem key={city._id} value={city._id || ''}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="category-filter">Filter by Category:</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {settings?.categories.map((category) => (
                  <SelectItem key={category._id} value={category._id || ''}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AddDistributionPointDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPoints.slice(0, 50).map((point) => {
              const city = settings?.cities.find(c => c._id === point.cityId);
              const category = settings?.categories.find(c => c._id === point.categoryId);
              return (
                <TableRow key={point._id}>
                  <TableCell className="font-medium">{point.name}</TableCell>
                  <TableCell>{city?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category?.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={point.isActive ? 'default' : 'secondary'}>
                      {point.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePointMutation.mutate(point._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredPoints.length > 50 && (
          <div className="mt-4 text-center text-gray-500">
            Showing first 50 of {filteredPoints.length} distribution points
          </div>
        )}
        {filteredPoints.length === 0 && (
          <div className="mt-4 text-center text-gray-500">
            No distribution points found with current filters
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AddCountryDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    const handleSubmit = () => {
      createCountryMutation.mutate({
        name,
        code,
        isActive: true
      });
      setOpen(false);
      setName('');
      setCode('');
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Country</DialogTitle>
            <DialogDescription>
              Enter the details for the new country you want to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="country-name">Country Name</Label>
              <Input
                id="country-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., United States"
              />
            </div>
            <div>
              <Label htmlFor="country-code">Country Code</Label>
              <Input
                id="country-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., US"
              />
            </div>
            <Button onClick={handleSubmit} disabled={!name || !code}>
              Create Country
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const AddCityDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [countryId, setCountryId] = useState('');

    const handleSubmit = () => {
      createCityMutation.mutate({
        name,
        state,
        countryId,
        isActive: true
      });
      setOpen(false);
      setName('');
      setState('');
      setCountryId('');
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add City
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>
              Enter the details for the new city you want to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="city-country">Country</Label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {settings?.countries.map((country) => (
                    <SelectItem key={country._id} value={country._id || ''}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city-name">City Name</Label>
              <Input
                id="city-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mumbai"
              />
            </div>
            <div>
              <Label htmlFor="city-state">State (Optional)</Label>
              <Input
                id="city-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., Maharashtra"
              />
            </div>
            <Button onClick={handleSubmit} disabled={!name || !countryId}>
              Create City
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const AddCategoryDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('MapPin');
    const [color, setColor] = useState('text-blue-600');
    const [defaultToteCount, setDefaultToteCount] = useState(400);

    const handleSubmit = () => {
      createCategoryMutation.mutate({
        name,
        icon,
        color,
        defaultToteCount,
        isActive: true
      });
      setOpen(false);
      setName('');
      setIcon('MapPin');
      setColor('text-blue-600');
      setDefaultToteCount(400);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Enter the details for the new distribution category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Airports"
              />
            </div>
            <div>
              <Label htmlFor="category-totes">Default Tote Count</Label>
              <Input
                id="category-totes"
                type="number"
                value={defaultToteCount}
                onChange={(e) => setDefaultToteCount(parseInt(e.target.value) || 400)}
                placeholder="400"
              />
            </div>
            <Button onClick={handleSubmit} disabled={!name}>
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const AddDistributionPointDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [cityId, setCityId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const handleSubmit = () => {
      createPointMutation.mutate({
        name,
        cityId,
        categoryId,
        isActive: true
      });
      setOpen(false);
      setName('');
      setCityId('');
      setCategoryId('');
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Distribution Point
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Distribution Point</DialogTitle>
            <DialogDescription>
              Enter the details for the new distribution point location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="point-city">City</Label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {settings?.cities.slice(0, 20).map((city) => (
                    <SelectItem key={city._id} value={city._id || ''}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="point-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {settings?.categories.map((category) => (
                    <SelectItem key={category._id} value={category._id || ''}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="point-name">Point Name</Label>
              <Input
                id="point-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Phoenix MarketCity"
              />
            </div>
            <Button onClick={handleSubmit} disabled={!name || !cityId || !categoryId}>
              Create Distribution Point
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const EditableCategoryToteCount = ({ category, onUpdate }: { category: DistributionCategory; onUpdate: (totes: number) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(category.defaultToteCount);

    const handleSave = () => {
      onUpdate(value);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value) || 0)}
            className="w-20"
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span>{category.defaultToteCount}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <AdminLayout 
      title="Distribution Settings" 
      subtitle="Manage countries, cities, categories, and distribution points"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="points">Distribution Points</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries">
          <CountriesTab />
        </TabsContent>
        
        <TabsContent value="cities">
          <CitiesTab />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
        
        <TabsContent value="points">
          <DistributionPointsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default DistributionSettings;