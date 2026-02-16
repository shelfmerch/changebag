import React, { useState, useRef, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Plus, Minus, MapPin, Building, Trees, Train, GraduationCap, Search, X, ChevronDown, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { fetchDistributionSettings, fetchPointsByCityAndCategory } from '@/services/distributionService';
import { DistributionCategory, DistributionPoint } from '@/types/distribution';
import { useToast } from '@/hooks/use-toast';

// Icon mapping for dynamic icons
const iconMap = {
  Building,
  Trees,
  MapPin,
  Train,
  GraduationCap
};

interface DistributionInfoStepProps {
  formData: {
    distributionType?: 'online' | 'physical';
    distributionStartDate?: Date;
    distributionEndDate?: Date;
    selectedCities?: string[];
    toteQuantity: number;
    distributionPoints?: {
      [city: string]: {
        [categoryId: string]: { name: string; totes: number; selected: boolean }[];
      };
    };
  };
  updateFormData: (data: Partial<any>) => void;
  goToStep?: (step: number) => void;
  validationError?: string | null;
}

const DistributionInfoStep: React.FC<DistributionInfoStepProps> = ({
  formData,
  updateFormData,
  goToStep,
  validationError
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCity, setOpenCity] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<{ city: string; category: string } | null>(null);
  const [toteError, setToteError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['distribution-settings'],
    queryFn: fetchDistributionSettings
  });

  // Get active cities and categories
  const activeCities = settings?.cities.filter(city => city.isActive) || [];
  const activeCategories = settings?.categories.filter(cat => cat.isActive) || [];

  // Long-press state for incrementing totes
  const incrementHoldTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const incrementHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasHoldingRef = useRef(false);

  const startIncrementHold = (
    city: string,
    categoryId: string,
    locationIndex: number
  ) => {
    // Start after a short delay to differentiate from a normal click
    if (incrementHoldTimeoutRef.current) clearTimeout(incrementHoldTimeoutRef.current);
    if (incrementHoldIntervalRef.current) clearInterval(incrementHoldIntervalRef.current as unknown as number);

    incrementHoldTimeoutRef.current = setTimeout(() => {
      wasHoldingRef.current = true;
      // Rapid repeat while held
      incrementHoldIntervalRef.current = setInterval(() => {
        handleToteChange(city, categoryId, locationIndex, (formData.distributionPoints?.[city]?.[categoryId]?.[locationIndex]?.totes || 0) + 50);
      }, 120) as unknown as NodeJS.Timeout;
    }, 250) as unknown as NodeJS.Timeout;
  };

  const stopIncrementHold = () => {
    if (incrementHoldTimeoutRef.current) {
      clearTimeout(incrementHoldTimeoutRef.current);
      incrementHoldTimeoutRef.current = null;
    }
    if (incrementHoldIntervalRef.current) {
      clearInterval(incrementHoldIntervalRef.current as unknown as number);
      incrementHoldIntervalRef.current = null;
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (incrementHoldTimeoutRef.current) clearTimeout(incrementHoldTimeoutRef.current);
      if (incrementHoldIntervalRef.current) clearInterval(incrementHoldIntervalRef.current as unknown as number);
    };
  }, []);

  // Get quick pick cities (first 8 active cities)
  const quickPickCities = activeCities.slice(0, 8).map(city => city.name);

  const filteredCities = activeCities
    .filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(formData.selectedCities || []).includes(city.name)
    )
    .map(city => city.name);

  // Add query for fetching points by city and category
  const fetchPointsForCityAndCategory = async (cityId: string, categoryId: string) => {
    if (!cityId || !categoryId) return [];
    return await fetchPointsByCityAndCategory(cityId, categoryId);
  };

  const handleCityAdd = async (cityName: string) => {
    const currentCities = formData.selectedCities || [];
    const updatedCities = [...currentCities, cityName];
    
    // Get the city ID
    const cityData = settings?.cities.find(c => c.name === cityName);
    if (!cityData?._id) return;

    // Initialize distribution points structure
    const updatedDistributionPoints = {
      ...formData.distributionPoints,
      [cityName]: {}
    };

    // Fetch points for each active category
    const categoryPromises = activeCategories.map(async category => {
      const points = await fetchPointsForCityAndCategory(cityData._id!, category._id!);
      updatedDistributionPoints[cityName][category._id!] = points.map(point => ({
        name: point.name,
        totes: point.defaultToteCount,
        selected: false
      }));
    });

    await Promise.all(categoryPromises);

    const updatedData = {
      selectedCities: updatedCities,
      distributionPoints: updatedDistributionPoints
    };
    updateFormData(updatedData);
    setSearchTerm('');
  };

  const handleCityRemove = async (cityToRemove: string) => {
    const updatedCities = (formData.selectedCities || []).filter(city => city !== cityToRemove);
    const updatedDistributionPoints = { ...formData.distributionPoints };
    delete updatedDistributionPoints[cityToRemove];
    
    const updatedData = {
      selectedCities: updatedCities,
      distributionPoints: updatedDistributionPoints
    };
    updateFormData(updatedData);
    
    if (openCity === cityToRemove) {
      setOpenCity(null);
      setOpenCategory(null);
    }
  };

  const wouldExceedToteLimit = (additionalTotes: number = 0): boolean => {
    const currentTotal = getOverallTotals().totalTotes;
    return (currentTotal + additionalTotes) > formData.toteQuantity;
  };

  const handleLocationToggle = (city: string, category: string, locationIndex: number) => {
    const currentPoints = formData.distributionPoints || {};
    const cityPoints = currentPoints[city];
    if (!cityPoints) return;

    const point = cityPoints[category as keyof typeof cityPoints][locationIndex];
    const defaultTotes = activeCategories.find(cat => cat._id === category)?.defaultToteCount || 0;

    const { totalTotes: currentTotalTotes } = getOverallTotals();

    if (!point.selected) {
      if ((currentTotalTotes + defaultTotes) > formData.toteQuantity) {
        setToteError(`Cannot select this location. Adding ${defaultTotes} totes would exceed your total tote quantity of ${formData.toteQuantity}. Please increase your tote quantity first.`);
        return;
      }
    }

    const updatedCategoryPoints = [...cityPoints[category as keyof typeof cityPoints]];
    updatedCategoryPoints[locationIndex] = {
      ...updatedCategoryPoints[locationIndex],
      selected: !point.selected,
      totes: !point.selected ? defaultTotes : point.totes
    };

    updateFormData({
      distributionPoints: {
        ...currentPoints,
        [city]: {
          ...cityPoints,
          [category]: updatedCategoryPoints
        }
      }
    });
    setToteError(null);
  };

  const handleToteChange = (city: string, category: string, locationIndex: number, newTotes: number) => {
    const currentPoints = formData.distributionPoints || {};
    const cityPoints = currentPoints[city];
    if (!cityPoints) return;

    const point = cityPoints[category as keyof typeof cityPoints][locationIndex];
    const minTotes = activeCategories.find(cat => cat._id === category)?.defaultToteCount || 0;
    const finalTotes = Math.max(newTotes, minTotes);

    const toteDifference = finalTotes - point.totes;
    const { totalTotes: currentTotalTotes } = getOverallTotals();
    const newTotalTotes = currentTotalTotes + toteDifference;

    if (newTotalTotes > formData.toteQuantity) {
      const remainingTotes = formData.toteQuantity - (currentTotalTotes - point.totes);
      setToteError(`Cannot allocate ${finalTotes} totes. You have ${remainingTotes} totes remaining out of your total ${formData.toteQuantity}. Please increase your tote quantity first.`);
      return;
    }

    const updatedCategoryPoints = [...cityPoints[category as keyof typeof cityPoints]];
    updatedCategoryPoints[locationIndex] = {
      ...updatedCategoryPoints[locationIndex],
      totes: finalTotes
    };

    updateFormData({
      distributionPoints: {
        ...currentPoints,
        [city]: {
          ...cityPoints,
          [category]: updatedCategoryPoints
        }
      }
    });
    setToteError(null);
  };

  const getTotalSelectedLocations = (city: string) => {
    const cityPoints = formData.distributionPoints?.[city];
    if (!cityPoints) return 0;
    
    return Object.values(cityPoints).reduce((total, locations) => {
      return total + locations.filter(loc => loc.selected).length;
    }, 0);
  };

  const getTotalTotes = (city: string) => {
    let total = 0;
    if (formData.distributionPoints?.[city]) {
      Object.values(formData.distributionPoints[city]).forEach(points => {
        points.forEach(point => {
          if (point.selected) total += point.totes;
        });
      });
    }
    return total;
  };

  const getOverallTotals = () => {
    let totalTotes = 0;
    let totalLocations = 0;
    let totalCities = 0;
    
    if (formData.distributionPoints) {
      totalCities = Object.keys(formData.distributionPoints).length;
      
      Object.entries(formData.distributionPoints).forEach(([city, categories]) => {
        Object.values(categories).forEach(points => {
          points.forEach(point => {
            if (point.selected) {
              totalTotes += point.totes;
              totalLocations++;
            }
          });
        });
      });
    }
    
    return { totalTotes, totalLocations, totalCities };
  };

  React.useEffect(() => {
    const { totalTotes } = getOverallTotals();
    
    if (totalTotes === 0 && formData.toteQuantity < 50) {
      updateFormData({ toteQuantity: 50 });
    }
  }, [formData.distributionPoints]);

  const { totalTotes, totalLocations, totalCities } = getOverallTotals();

  // Toast on validation errors instead of showing large banners
  useEffect(() => {
    if (validationError) {
      toast({
        title: 'Validation error',
        description: validationError,
        variant: 'destructive',
      });
    }
  }, [validationError, toast]);

  useEffect(() => {
    if (toteError) {
      toast({
        title: 'Tote limit exceeded',
        description: toteError,
        variant: 'destructive',
      });
    }
  }, [toteError, toast]);

  const handleCityAccordionToggle = (city: string) => {
    setOpenCity(openCity === city ? null : city);
    setOpenCategory(null);
  };

  const handleCategoryAccordionToggle = (city: string, category: string) => {
    const newCategoryKey = `${city}-${category}`;
    const currentKey = openCategory ? `${openCategory.city}-${openCategory.category}` : null;
    
    if (currentKey !== newCategoryKey) {
      // Fetch points when opening a new category
      const cityData = settings?.cities.find(c => c.name === city);
      if (cityData?._id) {
        fetchPointsForCityAndCategory(cityData._id, category)
          .then(points => {
            const currentPoints = formData.distributionPoints || {};
            const cityPoints = currentPoints[city] || {};
            
            // Update the distribution points with fetched data
            const updatedPoints = points.map(point => ({
              name: point.name,
              totes: point.defaultToteCount,
              selected: false
            }));
            
            updateFormData({
              distributionPoints: {
                ...currentPoints,
                [city]: {
                  ...cityPoints,
                  [category]: updatedPoints
                }
              }
            });
          });
      }
    }
    
    setOpenCategory(
      currentKey === newCategoryKey ? null : { city, category }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Distribution Information</h2>
        <p className="text-gray-600 mb-6">
          Choose how you want to distribute your totes to reach your target audience
        </p>
      </div>
      
      {/* Inline helper for quick navigation when totes exceed, shown subtly when error exists */}
      {toteError && goToStep && (
        <div className="mb-2 text-sm text-red-600 flex items-center gap-2">
          Tote Quantity Exceeded. 
          <Button
            variant="outline"
            size="sm"
            className="ml-1"
            onClick={() => goToStep(1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tote Quantity
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {/* Distribution Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.distributionType || ''}
              onValueChange={(type) => {
                const currentToteQuantity = formData.toteQuantity;
                const updatedData = {
                  distributionType: type,
                  distributionStartDate: undefined,
                  distributionEndDate: undefined,
                  selectedCities: [],
                  distributionPoints: {},
                  toteQuantity: currentToteQuantity
                };
                updateFormData(updatedData);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="cursor-pointer font-medium">
                  Online Campaign
                  <p className="text-sm text-gray-500 font-normal">Digital distribution with date range</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="physical" id="physical" />
                <Label htmlFor="physical" className="cursor-pointer font-medium">
                  Physical Distribution
                  <p className="text-sm text-gray-500 font-normal">Real-world locations in Indian cities</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Online Distribution Fields */}
        {formData.distributionType === 'online' && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left",
                          !formData.distributionStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.distributionStartDate ? (
                          format(formData.distributionStartDate, "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                          mode="single"
                          selected={formData.distributionStartDate}
                          onSelect={(date) => {
                            if (date) {
                              // Normalize to local start of day (avoid timezone shift)
                              const localDate = new Date(date);
                              localDate.setHours(0, 0, 0, 0);
                              updateFormData({ 
                                distributionStartDate: localDate, 
                                distributionEndDate: undefined 
                              });
                            }
                          }}
                          initialFocus
                          className="p-3"
                          disabled={(date) => {
                            // Only allow dates 4 days after today (local)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const minStartDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
                            return date < minStartDate;
                          }}
                        />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Campaign End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left",
                          !formData.distributionEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.distributionEndDate ? (
                          format(formData.distributionEndDate, "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                          mode="single"
                          selected={formData.distributionEndDate}
                          onSelect={(date) => {
                            if (
                              formData.distributionStartDate &&
                              date &&
                              date > formData.distributionStartDate
                            ) {
                              // Normalize to local end of day (avoid timezone shift)
                              const localDate = new Date(date);
                              localDate.setHours(23, 59, 59, 999);
                              updateFormData({ distributionEndDate: localDate });
                            }
                          }}
                          initialFocus
                          className="p-3"
                          disabled={(date) => {
                            // End date must be at least 1 day after start date
                            if (!formData.distributionStartDate) return true;
                            const minEndDate = new Date(formData.distributionStartDate.getTime() + 24 * 60 * 60 * 1000);
                            return date < minEndDate;
                          }}
                        />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Physical Distribution Fields */}
        {formData.distributionType === 'physical' && (
          <div className="space-y-6">
            {/* Campaign Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Duration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set the start and end dates for your physical distribution campaign
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left",
                            !formData.distributionStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.distributionStartDate ? (
                            format(formData.distributionStartDate, "PPP")
                          ) : (
                            <span>Pick start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.distributionStartDate}
                          onSelect={(date) => {
                            if (date) {
                              // Normalize to local start of day (avoid timezone shift)
                              const localDate = new Date(date);
                              localDate.setHours(0, 0, 0, 0);
                              updateFormData({ 
                                distributionStartDate: localDate, 
                                distributionEndDate: undefined 
                              });
                            }
                          }}
                          initialFocus
                          className="p-3"
                          disabled={(date) => {
                            // Only allow dates 4 days after today (local)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const minStartDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
                            return date < minStartDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left",
                            !formData.distributionEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.distributionEndDate ? (
                            format(formData.distributionEndDate, "PPP")
                          ) : (
                            <span>Pick end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.distributionEndDate}
                          onSelect={(date) => {
                            if (
                              formData.distributionStartDate &&
                              date &&
                              date > formData.distributionStartDate
                            ) {
                              // Normalize to local end of day (avoid timezone shift)
                              const localDate = new Date(date);
                              localDate.setHours(23, 59, 59, 999);
                              updateFormData({ distributionEndDate: localDate });
                            }
                          }}
                          initialFocus
                          className="p-3"
                          disabled={(date) => {
                            // End date must be at least 1 day after start date
                            if (!formData.distributionStartDate) return true;
                            const minEndDate = new Date(formData.distributionStartDate.getTime() + 24 * 60 * 60 * 1000);
                            return date < minEndDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Cities</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose the cities where you want to distribute totes
                </p>
              </CardHeader>
              <CardContent>
                {/* Quick Pick Cities */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Quick Pick Cities</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickPickCities.map((city) => (
                      <Button
                        key={city}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCityAdd(city)}
                        disabled={(formData.selectedCities || []).includes(city)}
                        className="text-xs"
                      >
                        + {city}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs font-medium text-muted-foreground">Coming Soon</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Delhi', 'Mumbai', 'Bangalore'].map((city) => (
                        <Button
                          key={`coming-${city}`}
                          variant="outline"
                          size="sm"
                          disabled
                          title="Coming soon"
                          className="text-xs opacity-60 cursor-not-allowed"
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search Cities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for cities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredCities.slice(0, 8).map((city) => (
                          <button
                            key={city}
                            onClick={() => handleCityAdd(city)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Cities as Chips */}
                {formData.selectedCities && formData.selectedCities.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Selected Cities</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedCities.map((city) => (
                        <Badge key={city} variant="secondary" className="px-2 py-1">
                          {city}
                          <button
                            onClick={() => handleCityRemove(city)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Points for Selected Cities - Full Width */}
            {formData.selectedCities && formData.selectedCities.length > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Distribution Points & Tote Allocation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select specific locations and customize tote quantities for each city
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.selectedCities.map((cityName) => (
                      <div key={cityName} className="border rounded-lg">
                        {/* City Header */}
                        <button
                          onClick={() => handleCityAccordionToggle(cityName)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                          aria-expanded={openCity === cityName}
                          aria-controls={`city-${cityName}-content`}
                        >
                          <div className="flex items-center space-x-3">
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 transition-transform",
                                openCity === cityName && "rotate-180"
                              )}
                            />
                            <span className="font-medium">{cityName}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getTotalSelectedLocations(cityName)} locations • {getTotalTotes(cityName)} totes
                          </Badge>
                        </button>

                        {/* City Content */}
                        {openCity === cityName && (
                          <div id={`city-${cityName}-content`} className="px-4 pb-4 space-y-2">
                            {activeCategories.map((category) => {
                              const Icon = iconMap[category.icon as keyof typeof iconMap] || MapPin;
                              const cityPoints = formData.distributionPoints?.[cityName];
                              const categoryPoints = cityPoints?.[category._id!] || [];
                              const selectedCount = categoryPoints.filter(point => point.selected).length;
                              // const isOpen = openCategory?.city === cityName && openCategory?.category === category._id;
                              
                              return (
  <div key={category._id} className="border rounded-lg">
    <div id={`category-${cityName}-${category._id}-content`} className="px-3 p-3 space-y-2">
      {categoryPoints.map((point, index) => (
        <div key={index} className={cn(
          "flex items-center justify-between p-2 border rounded",
          point.selected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
        )}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${cityName}-${category._id}-${index}`}
              checked={point.selected}
              onCheckedChange={() => handleLocationToggle(cityName, category._id!, index)}
            />
            <Label
              htmlFor={`${cityName}-${category._id}-${index}`}
              className="text-xs cursor-pointer"
            >
              {point.name}
            </Label>
          </div>
          {point.selected && (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToteChange(cityName, category._id!, index, point.totes - 50)}
                disabled={point.totes <= category.defaultToteCount}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-2 w-2" />
              </Button>
              <Input
                type="number"
                value={point.totes}
                onChange={(e) => handleToteChange(cityName, category._id!, index, parseInt(e.target.value) || category.defaultToteCount)}
                className="w-16 h-6 text-xs text-center p-1"
                min={category.defaultToteCount}
              />
              <Button
                variant="outline"
                size="sm"
                onMouseDown={() => startIncrementHold(cityName, category._id!, index)}
                onMouseUp={() => stopIncrementHold()}
                onMouseLeave={() => stopIncrementHold()}
                onTouchStart={() => startIncrementHold(cityName, category._id!, index)}
                onTouchEnd={() => stopIncrementHold()}
                onClick={(e) => {
                  // If a long press occurred, avoid triggering an extra single increment on click
                  if (wasHoldingRef.current) {
                    wasHoldingRef.current = false;
                    return;
                  }
                  handleToteChange(cityName, category._id!, index, point.totes + 50);
                }}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-2 w-2" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Card - Full Width on Mobile */}
            {totalCities > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Distribution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalTotes.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Totes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totalCities}</div>
                      <div className="text-sm text-gray-600">Cities</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{totalLocations}</div>
                      <div className="text-sm text-gray-600">Locations</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Cities</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {formData.selectedCities?.map((city) => (
                        <div key={city} className="flex justify-between text-xs p-2 bg-gray-50 rounded">
                          <span>{city}</span>
                          <span className="text-gray-500">{getTotalTotes(city)} totes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionInfoStep;
