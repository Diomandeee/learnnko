// src/components/routes/controls/location-selector.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouteStore } from "@/store/route-store";
import { useCoffeeShops } from "@/hooks/use-coffee-shops";
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocationSelector() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [showVisited, setShowVisited] = useState("all");
  const { shops, loading } = useCoffeeShops();
  const { addLocation, selectedLocations } = useRouteStore();

  const filteredShops = shops?.filter(shop => {
    const matchesSearch = shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = selectedArea === "all" || shop.area === selectedArea;
    
    const matchesVisited = showVisited === "all" ||
      (showVisited === "visited" && shop.visited) ||
      (showVisited === "not_visited" && !shop.visited);

    const isNotSelected = !selectedLocations.find(loc => loc.id === shop.id);

    return matchesSearch && matchesArea && matchesVisited && isNotSelected;
  }) || [];

  const areas = shops ? [...new Set(shops.map(shop => shop.area).filter(Boolean))] : [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Loading locations...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={showVisited}
              onValueChange={setShowVisited}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visit status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="visited">Visited Only</SelectItem>
                <SelectItem value="not_visited">Not Visited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium truncate">{shop.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {shop.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shop.volume && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{shop.volume}</span>
                      </div>
                    )}
                    {shop.visited && (
                      <Badge variant="success" className="text-xs">
                        Visited
                      </Badge>
                    )}
                    {shop.parlor_coffee_leads && (
                      <Badge variant="warning" className="text-xs">
                        Lead
                      </Badge>
                    )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addLocation(shop)}
                >
                  Add
                </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredShops.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No locations found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}