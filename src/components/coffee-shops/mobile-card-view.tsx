"use client";

import { useState } from "react";
import { CoffeeShop } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EditableCell, DateCell, StarRating } from "./editable-cell";

interface MobileCardViewProps {
  shops: CoffeeShop[];
  onVisitToggle: (shop: CoffeeShop) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdate: (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => Promise<void>;
}

export function MobileCardView({ shops, onVisitToggle, onDelete, onUpdate }: MobileCardViewProps) {
  return (
    <div className="space-y-4">
      {shops.map((shop) => (
        <Card key={shop.id}>
          <CardHeader>
            <CardTitle>{shop.title}</CardTitle>
            <CardDescription>{shop.area}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center justify-between">
                    <div>Details</div>
                    <Edit className="h-4 w-4" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>Priority</div>
                      <StarRating
                        value={shop.priority || 0}
                        onUpdate={(value) => onUpdate(shop, "priority", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Partner Status</div>
                      <Badge
                        variant={shop.isPartner ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => onUpdate(shop, "isPartner", !shop.isPartner)}
                      >
                        {shop.isPartner ? "Partner" : "Not Partner"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Manager Present</div>
                      <EditableCell
                        value={shop.manager_present}
                        onUpdate={(value) => onUpdate(shop, "manager_present", value)}
                        type="manager"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Contact Name</div>
                      <EditableCell
                        value={shop.contact_name}
                        onUpdate={(value) => onUpdate(shop, "contact_name", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Contact Email</div>
                      <EditableCell
                        value={shop.contact_email}
                        onUpdate={(value) => onUpdate(shop, "contact_email", value)}
                        type="email"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Owners</div>
                      <EditableCell
                        value={shop.owners.map((owner) => `${owner.name} (${owner.email})`).join(", ") || null}
                        onUpdate={async (value) => {
                          const owners = value
                            ? value
                                .split(",")
                                .map((owner) => {
                                  const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
                                  if (match) {
                                    return {
                                      name: match[1].trim(),
                                      email: match[2].trim(),
                                    };
                                  }
                                  return null;
                                })
                                .filter(Boolean)
                            : [];
                          await onUpdate(shop, "owners", owners);
                        }}
                        type="owners"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Volume</div>
                      <EditableCell
                        value={shop.volume?.toString() || null}
                        onUpdate={(value) => onUpdate(shop, "volume", value)}
                        type="volume"
                      />
                    </div>
                    <div>
                      <div>ARR</div>
                      <div>
                        {shop.volume ? (
                          <span>${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}</span>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>First Visit</div>
                      <DateCell
                        date={shop.first_visit ? new Date(shop.first_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "first_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "first_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Second Visit</div>
                      <DateCell
                        date={shop.second_visit ? new Date(shop.second_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "second_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "second_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Third Visit</div>
                      <DateCell
                        date={shop.third_visit ? new Date(shop.third_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "third_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "third_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Rating</div>
                      <EditableCell
                        value={shop.rating?.toString()}
                        onUpdate={(value) => onUpdate(shop, "rating", value ? parseFloat(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Reviews</div>
                      <EditableCell
                        value={shop.reviews?.toString()}
                        onUpdate={(value) => onUpdate(shop, "reviews", value ? parseInt(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Instagram</div>
                      <EditableCell
                        value={shop.instagram || ""}
                        onUpdate={(value) => onUpdate(shop, "instagram", value)}
                        type="instagram"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Followers</div>
                      <EditableCell
                        value={shop.followers?.toString()}
                        onUpdate={(value) => onUpdate(shop, "followers", value ? parseInt(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Lead Status</div>
                      <Badge
                        variant={shop.parlor_coffee_leads ? "warning" : "default"}
                        className="cursor-pointer"
                        onClick={() => onUpdate(shop, "parlor_coffee_leads", !shop.parlor_coffee_leads)}
                      >
                        {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                      </Badge>
                    </div>
                    <div>
                      <div>Notes</div>
                      <EditableCell
                        value={shop.notes}
                        onUpdate={(value) => onUpdate(shop, "notes", value)}
                        type="notes"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-4 flex items-center justify-between">
              <div>Visit Status</div>
              <Badge
                variant={shop.visited ? "success" : "default"}
                className="cursor-pointer"
                onClick={() => onUpdate(shop, "visited", !shop.visited)}
              >
                {shop.visited ? "Visited" : "Not Visited"}
              </Badge>
            </div>
          </CardContent>
          <CardContent className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(shop.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}