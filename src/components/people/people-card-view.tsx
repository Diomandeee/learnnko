"use client";

import { Person } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Mail, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";

interface PeopleCardViewProps {
  people: Person[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (person: Person, field: keyof Person, value: any) => Promise<void>;
}

export function PeopleCardView({ people, onDelete, onUpdate }: PeopleCardViewProps) {
  return (
    <div className="space-y-4">
      {people.map((person) => (
        <Card key={person.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {person.firstName || person.lastName ? (
                    `${person.firstName || ''} ${person.lastName || ''}`
                  ) : (
                    <span className="text-muted-foreground">No name</span>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline">
                    {person.email}
                  </a>
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(person.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="details">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>Details</span>
                    <Edit className="h-4 w-4" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">
                          {person.phone || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Company</div>
                        <div className="text-sm text-muted-foreground">
                          {person.company || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1">Status</div>
                      <div className="flex gap-2">
                        <Badge variant={person.emailType === 'professional' ? 'default' : 'secondary'}>
                          {person.emailType}
                        </Badge>
                        <Badge variant={
                          person.verificationStatus === 'VALID' ? 'success' :
                          person.verificationStatus === 'INVALID' ? 'destructive' :
                          'secondary'
                        }>
                          {person.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Notes</div>
                      <div className="text-sm text-muted-foreground">
                        {person.notes || 'No notes'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Added</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(person.createdAt), 'PPP')}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
