// "use client"
// import React, { useState, useEffect } from 'react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Calendar, User, MapPin, Coffee } from 'lucide-react';
// import './styles.css';

// import { FormData, BookedAddOn, QuoteResult, QuoteBreakdown, TimelinePoint } from './types';
// import { DRINK_TYPES, EVENT_TYPES } from './constants';
// import {
//   calculateByTheCupPrice,
//   calculateHourlyRatePrice,
//   calculateHybridModelPrice,
//   validateDates,
//   formatCurrency,
//   generateTimelinePoints,
//   calculateDetailedBreakdown
// } from './utils';

// const EventPlanner: React.FC = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     email: '',
//     phone: '',
//     eventName: '',
//     eventDate: '',
//     eventTime: '',
//     eventDuration: '',
//     multiDayEvent: false,
//     eventEndDate: '',
//     recurringEvent: false,
//     recurringFrequency: 'daily',
//     guestCount: '',
//     eventType: '',
//     eventLocation: '',
//     customBranding: 'none',
//     staffUniform: 'standard',
//     customDrink: '',
//     specialInstructions: '',
//     selectedDrinks: new Set(),
//     equipmentUpgrades: new Set(),
//     addOnExperiences: new Set()
//   });

//   const [bookedAddOns, setBookedAddOns] = useState<BookedAddOn[]>([]);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [showAlert, setShowAlert] = useState(false);
//   const [designPreviews, setDesignPreviews] = useState<string[]>([]);

//   useEffect(() => {
//     if (formData.eventDuration && formData.eventTime) {
//       updateTimeline();
//     }
//   }, [formData.eventDuration, formData.eventTime]);

//   const updateTimeline = () => {
//     const duration = parseInt(formData.eventDuration);
//     const startTime = formData.eventTime;
//     const timeline = document.getElementById('timeline');
    
//     if (timeline) {
//       timeline.innerHTML = '';
      
//       for (let i = 0; i <= duration; i++) {
//         const timePoint = new Date(`2000-01-01T${startTime}`);
//         timePoint.setHours(timePoint.getHours() + i);
//         const timeLabel = timePoint.toTimeString().slice(0, 5);

//         const point = document.createElement('div');
//         point.className = 'timeline-point bg-gray-100 p-2 rounded';
//         point.textContent = timeLabel;
//         timeline.appendChild(point);
//       }
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

//     setFormData(prev => ({
//       ...prev,
//       [name]: inputValue
//     }));

//     if (errors[name]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       const previews = files.map(file => URL.createObjectURL(file));
//       setDesignPreviews(prev => [...prev, ...previews]);
//     }
//   };

//   const handleDrinkSelection = (drinkId: string) => {
//     setFormData(prev => {
//       const newSelectedDrinks = new Set(prev.selectedDrinks);
//       if (newSelectedDrinks.has(drinkId)) {
//         newSelectedDrinks.delete(drinkId);
//       } else {
//         newSelectedDrinks.add(drinkId);
//       }
//       return { ...prev, selectedDrinks: newSelectedDrinks };
//     });
//   };

//   const addBookedAddOn = (service: string, time: string) => {
//     setBookedAddOns(prev => [...prev, { service, time }]);
//   };

//   const removeBookedAddOn = (index: number) => {
//     setBookedAddOns(prev => prev.filter((_, i) => i !== index));
//   };

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {};
  
//     switch (step) {
//       case 1:
//         if (!formData.name) newErrors.name = 'Name is required';
//         if (!formData.email) newErrors.email = 'Email is required';
//         if (!formData.eventName) newErrors.eventName = 'Event name is required';
//         if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
//         if (!formData.eventTime) newErrors.eventTime = 'Start time is required';
//         if (!formData.eventDuration) newErrors.eventDuration = 'Duration is required';
//         if (!formData.guestCount) newErrors.guestCount = 'Guest count is required';
        
//         // Validate date is in the future
//         if (formData.eventDate && !validateDates(formData.eventDate)) {
//           newErrors.eventDate = 'Event date must be in the future';
//         }
        
//         // Validate duration
//         const duration = parseInt(formData.eventDuration);
//         if (isNaN(duration) || duration < 1) {
//           newErrors.eventDuration = 'Duration must be at least 1 hour';
//         }
        
//         // Validate guest count
//         const guests = parseInt(formData.guestCount);
//         if (isNaN(guests) || guests < 1) {
//           newErrors.guestCount = 'Guest count must be at least 1';
//         }
//         break;
  
//       case 2:
//         if (formData.selectedDrinks.size === 0) {
//           newErrors.drinks = 'Please select at least one drink option';
//         }
//         break;
//     }
  
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const calculateQuote = () => {
//     if (!validateStep(4)) return;
  
//     const guestCount = parseInt(formData.guestCount);
//     const duration = parseInt(formData.eventDuration);
  
//     const byTheCupPrice = calculateByTheCupPrice(guestCount, duration, formData);
//     const hourlyRatePrice = calculateHourlyRatePrice(duration, guestCount, formData);
//     const hybridModelPrice = calculateHybridModelPrice(duration, guestCount, formData);
  
//     const bestPrice = Math.min(byTheCupPrice, hourlyRatePrice, hybridModelPrice);
//     let recommendedModel = '';
  
//     if (bestPrice === byTheCupPrice) {
//       recommendedModel = 'By-the-Cup Model';
//     } else if (bestPrice === hourlyRatePrice) {
//       recommendedModel = 'Hourly Rate Model';
//     } else {
//       recommendedModel = 'Hybrid Model';
//     }
  
//     // Use the calculateDetailedBreakdown function instead of hardcoding percentages
//     const breakdown = calculateDetailedBreakdown(
//       formData,
//       guestCount,
//       duration,
//       recommendedModel,
//       bestPrice
//     );
  
//     setQuoteResult({
//       totalPrice: bestPrice,
//       recommendedModel,
//       breakdown
//     });
  
//     setCurrentStep(5);
//   };
//   const renderEventDetails = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <Label htmlFor="name">Name</Label>
//           <Input
//             id="name"
//             name="name"
//             value={formData.name}
//             onChange={handleInputChange}
//             className={errors.name ? 'border-red-500' : ''}
//           />
//           {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
//         </div>

//         <div>
//           <Label htmlFor="email">Email</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleInputChange}
//             className={errors.email ? 'border-red-500' : ''}
//           />
//           {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
//         </div>

//         <div>
//           <Label htmlFor="phone">Phone</Label>
//           <Input
//             id="phone"
//             name="phone"
//             type="tel"
//             value={formData.phone}
//             onChange={handleInputChange}
//           />
//         </div>

//         <div>
//           <Label htmlFor="eventName">Event Name</Label>
//           <Input
//             id="eventName"
//             name="eventName"
//             value={formData.eventName}
//             onChange={handleInputChange}
//             className={errors.eventName ? 'border-red-500' : ''}
//           />
//           {errors.eventName && <span className="text-red-500 text-sm">{errors.eventName}</span>}
//         </div>

//         <div>
//           <Label htmlFor="eventDate">Event Date</Label>
//           <Input
//             id="eventDate"
//             name="eventDate"
//             type="date"
//             value={formData.eventDate}
//             onChange={handleInputChange}
//             className={errors.eventDate ? 'border-red-500' : ''}
//           />
//           {errors.eventDate && <span className="text-red-500 text-sm">{errors.eventDate}</span>}
//         </div>

//         <div>
//           <Label htmlFor="eventTime">Start Time</Label>
//           <Input
//             id="eventTime"
//             name="eventTime"
//             type="time"
//             value={formData.eventTime}
//             onChange={handleInputChange}
//           />
//         </div>

//         <div>
//           <Label htmlFor="eventDuration">Duration (hours)</Label>
//           <Input
//             id="eventDuration"
//             name="eventDuration"
//             type="number"
//             min="1"
//             value={formData.eventDuration}
//             onChange={handleInputChange}
//             className={errors.eventDuration ? 'border-red-500' : ''}
//           />
//           {errors.eventDuration && <span className="text-red-500 text-sm">{errors.eventDuration}</span>}
//         </div>

//         <div>
//           <Label htmlFor="guestCount">Expected Guests</Label>
//           <Input
//             id="guestCount"
//             name="guestCount"
//             type="number"
//             min="1"
//             value={formData.guestCount}
//             onChange={handleInputChange}
//             className={errors.guestCount ? 'border-red-500' : ''}
//           />
//           {errors.guestCount && <span className="text-red-500 text-sm">{errors.guestCount}</span>}
//         </div>

//         <div>
//           <Label htmlFor="eventType">Event Type</Label>
//           <Select 
//             name="eventType"
//             value={formData.eventType}
//             onValueChange={(value) => handleInputChange({
//               target: { name: 'eventType', value }
//             } as any)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select event type" />
//             </SelectTrigger>
//             <SelectContent>
//               {EVENT_TYPES.map(type => (
//                 <SelectItem key={type.value} value={type.value}>
//                   {type.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="col-span-2">
//           <Label htmlFor="eventLocation">Event Location</Label>
//           <Textarea
//             id="eventLocation"
//             name="eventLocation"
//             value={formData.eventLocation}
//             onChange={handleInputChange}
//             rows={3}
//           />
//         </div>
//       </div>
//     </div>
//   );

//   const renderMenuSelection = () => (
//     <div className="space-y-6">
//       <h3 className="text-lg font-semibold">Select Drinks</h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {Object.entries(DRINK_TYPES).map(([category, drinks]) => (
//           <Card key={category} className="p-4">
//             <h4 className="font-semibold mb-4 capitalize">{category}</h4>
//             <div className="space-y-2">
//               {drinks.map(drink => (
//                 <div key={drink.id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={drink.id}
//                     checked={formData.selectedDrinks.has(drink.id)}
//                     onChange={() => handleDrinkSelection(drink.id)}
//                     className="mr-2"
//                   />
//                   <Label htmlFor={drink.id}>{drink.name}</Label>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         ))}
//       </div>
//       {errors.drinks && <span className="text-red-500">{errors.drinks}</span>}
//     </div>
//   );

//   const renderAdditionalServices = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card className="p-4">
//           <h3 className="font-semibold mb-4">Equipment Upgrades</h3>
//           <div className="space-y-2">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="pourOverBar"
//                 checked={formData.equipmentUpgrades.has('pourOverBar')}
//                 onChange={() => {
//                   const newUpgrades = new Set(formData.equipmentUpgrades);
//                   if (newUpgrades.has('pourOverBar')) {
//                     newUpgrades.delete('pourOverBar');
//                   } else {
//                     newUpgrades.add('pourOverBar');
//                   }
//                   setFormData(prev => ({ ...prev, equipmentUpgrades: newUpgrades }));
//                 }}
//                 className="mr-2"
//               />
//               <Label htmlFor="pourOverBar">Pour-Over Bar ($200 + $1.50/cup)</Label>
//             </div>
//             {/* Add other equipment options */}
//           </div>
//         </Card>

//         <Card className="p-4">
//           <h3 className="font-semibold mb-4">Add-On Experiences</h3>
//           <div className="space-y-2">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="latteArt"
//                 checked={formData.addOnExperiences.has('latteArt')}
//                 onChange={() => {
//                   const newExperiences = new Set(formData.addOnExperiences);
//                   if (newExperiences.has('latteArt')) {
//                     newExperiences.delete('latteArt');
//                   } else {
//                     newExperiences.add('latteArt');
//                   }
//                   setFormData(prev => ({ ...prev, addOnExperiences: newExperiences }));
//                 }}
//                 className="mr-2"
//               />
//               <Label htmlFor="latteArt">Latte Art Demonstration ($250/hour)</Label>
//             </div>
//             {/* Add other experience options */}
//           </div>
//         </Card>
//       </div>

//       <Card className="p-4">
//       <h3 className="font-semibold mb-4">Timeline</h3>
//         <div id="timeline" className="flex space-x-4 overflow-x-auto p-4">
//           {/* Timeline points will be populated by updateTimeline() */}
//         </div>

//         <div className="mt-4">
//           <h4 className="font-semibold mb-2">Book Add-On Times</h4>
//           <div className="flex space-x-4">
//             <Select
//               onValueChange={(value) => setFormData(prev => ({
//                 ...prev,
//                 selectedAddOn: value
//               }))}
//             >
//               <SelectTrigger className="w-[200px]">
//                 <SelectValue placeholder="Select add-on" />
//               </SelectTrigger>
//               <SelectContent>
//                 {Array.from(formData.addOnExperiences).map(experience => (
//                   <SelectItem key={experience} value={experience}>
//                     {experience}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Input
//               type="time"
//               className="w-[150px]"
//               onChange={(e) => setFormData(prev => ({
//                 ...prev,
//                 selectedTime: e.target.value
//               }))}
//             />
//             <Button 
//               onClick={() => {
//                 if (formData.selectedAddOn && formData.selectedTime) {
//                   addBookedAddOn(formData.selectedAddOn, formData.selectedTime);
//                 }
//               }}
//             >
//               Add
//             </Button>
//           </div>
//         </div>

//         <div className="mt-4">
//           <h4 className="font-semibold mb-2">Booked Add-Ons</h4>
//           <div className="space-y-2">
//             {bookedAddOns.map((addon, index) => (
//               <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
//                 <span>{addon.service} at {addon.time}</span>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => removeBookedAddOn(index)}
//                 >
//                   Remove
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </Card>

//       <Card className="p-4">
//         <h3 className="font-semibold mb-4">Customization Options</h3>
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="customBranding">Branding Options</Label>
//             <Select
//               name="customBranding"
//               value={formData.customBranding}
//               onValueChange={(value) => handleInputChange({
//                 target: { name: 'customBranding', value }
//               } as any)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select branding option" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">No Branding</SelectItem>
//                 <SelectItem value="cups">Custom Cups ($0.75/cup)</SelectItem>
//                 <SelectItem value="deluxe">Deluxe Branding ($1.00/cup)</SelectItem>
//                 <SelectItem value="full">Full Custom Branding ($500 + $0.75/cup)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div>
//             <Label htmlFor="staffUniform">Staff Uniform</Label>
//             <Select
//               name="staffUniform"
//               value={formData.staffUniform}
//               onValueChange={(value) => handleInputChange({
//                 target: { name: 'staffUniform', value }
//               } as any)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select uniform option" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="standard">Standard Uniform</SelectItem>
//                 <SelectItem value="custom">Custom Themed Uniform ($50/staff)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );

//   const renderSpecialRequests = () => (
//     <div className="space-y-6">
//       <Card className="p-4">
//         <h3 className="font-semibold mb-4">Custom Drink Creation</h3>
//         <Textarea
//           name="customDrink"
//           value={formData.customDrink}
//           onChange={handleInputChange}
//           placeholder="Describe your custom drink idea..."
//           className="min-h-[100px]"
//         />
//         <p className="text-sm text-gray-500 mt-2">
//           $200 one-time fee for recipe development
//         </p>
//       </Card>

//       <Card className="p-4">
//         <h3 className="font-semibold mb-4">Special Instructions</h3>
//         <Textarea
//           name="specialInstructions"
//           value={formData.specialInstructions}
//           onChange={handleInputChange}
//           placeholder="Any additional requests or special instructions..."
//           className="min-h-[100px]"
//         />
//       </Card>

//       <Card className="p-4">
//         <h3 className="font-semibold mb-4">Design Upload</h3>
//         <Input
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={handleFileUpload}
//           className="mb-4"
//         />
//         <div className="grid grid-cols-4 gap-4">
//           {designPreviews.map((preview, index) => (
//             <img
//               key={index}
//               src={preview}
//               alt={`Design preview ${index + 1}`}
//               className="w-24 h-24 object-cover rounded"
//             />
//           ))}
//         </div>
//       </Card>
//     </div>
//   );

//     // Update the timeline generation
//   const renderTimeline = (timePoints: TimelinePoint[]) => {
//     return (
//       <div className="grid grid-cols-[auto,1fr] gap-4">
//         {timePoints.map((point, index) => (
//           <React.Fragment key={index}>
//             <div className="text-sm font-medium">
//               {point.time}
//             </div>
//             <div className="text-sm text-gray-600">
//               {point.events.length > 0 ? (
//                 point.events.map((event, eventIndex) => (
//                   <div key={eventIndex} className="text-green-600">
//                     {event.service}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-gray-400">
//                   {index === 0 ? 'Setup' : 
//                   index === timePoints.length - 1 ? 'Teardown' : 
//                   'Regular Service'}
//                 </div>
//               )}
//             </div>
//           </React.Fragment>
//         ))}
//       </div>
//     );
//   };

//   // Update the quote breakdown section
//   const renderDetailedBreakdown = (breakdown: QuoteBreakdown[]) => (
//     <div className="space-y-6">
//       {breakdown.map((section, index) => (
//         <div key={index} className="mb-6">
//           <h5 className="font-semibold text-gray-700 mb-2">{section.category}</h5>
//           <div className="space-y-2">
//             {section.items.map((item, itemIndex) => (
//               <div key={itemIndex} className="flex justify-between text-sm">
//                 <div className="flex-1">
//                   <div>{item.label}</div>
//                   {item.details && (
//                     <div className="text-gray-500 text-xs mt-1">{item.details}</div>
//                   )}
//                 </div>
//                 <div className="ml-4 text-right whitespace-nowrap">
//                   {formatCurrency(item.amount)}
//                 </div>
//               </div>
//             ))}
//             <div className="flex justify-between font-medium pt-2 border-t">
//               <span>Subtotal</span>
//               <span>{formatCurrency(section.subtotal)}</span>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const renderQuoteResult = () => {
//     const guestCount = parseInt(formData.guestCount);
//     const duration = parseInt(formData.eventDuration);
  
//     const byTheCupBreakdown = calculateDetailedBreakdown(
//       formData,
//       guestCount,
//       duration,
//       'By-the-Cup Model',
//       calculateByTheCupPrice(guestCount, duration, formData)
//     );
  
//     const hourlyRateBreakdown = calculateDetailedBreakdown(
//       formData,
//       guestCount,
//       duration,
//       'Hourly Rate Model',
//       calculateHourlyRatePrice(duration, guestCount, formData)
//     );
  
//     const hybridBreakdown = calculateDetailedBreakdown(
//       formData,
//       guestCount,
//       duration,
//       'Hybrid Model',
//       calculateHybridModelPrice(duration, guestCount, formData)
//     );
  
//     return (
//       <div className="space-y-6">
//         {quoteResult && (
//           <Card className="p-6">
//             <h3 className="text-xl font-semibold mb-6">Your Custom Event Quote</h3>
            
//             <div className="space-y-6">
//               {/* Event Summary */}
//               <div className="bg-gray-50 p-4 rounded">
//                 <h4 className="font-semibold mb-2">Event Summary</h4>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div><strong>Event:</strong> {formData.eventName}</div>
//                   <div><strong>Date:</strong> {formData.eventDate}</div>
//                   <div><strong>Time:</strong> {formData.eventTime}</div>
//                   <div><strong>Duration:</strong> {formData.eventDuration} hours</div>
//                   <div><strong>Guests:</strong> {formData.guestCount}</div>
//                   <div><strong>Location:</strong> {formData.eventLocation || 'TBD'}</div>
//                   <div><strong>Event Type:</strong> {formData.eventType || 'Not specified'}</div>
//                   <div><strong>Selected Drinks:</strong> {formData.selectedDrinks.size}</div>
//                 </div>
//               </div>
  
//               {/* Pricing Comparison */}
//               <div className="border-t border-b border-gray-200 py-4">
//                 <h4 className="font-semibold mb-4">Pricing Model Comparison</h4>
//                 <div className="grid grid-cols-3 gap-6">
//                   <div className={`p-4 rounded ${quoteResult.recommendedModel === 'By-the-Cup Model' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
//                     <div className="font-semibold mb-2">By-the-Cup Model</div>
//                     <div className="text-2xl font-bold mb-2">
//                       {formatCurrency(calculateByTheCupPrice(guestCount, duration, formData))}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Best for events with predictable consumption
//                     </div>
//                   </div>
                  
//                   <div className={`p-4 rounded ${quoteResult.recommendedModel === 'Hourly Rate Model' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
//                     <div className="font-semibold mb-2">Hourly Rate Model</div>
//                     <div className="text-2xl font-bold mb-2">
//                       {formatCurrency(calculateHourlyRatePrice(duration, guestCount, formData))}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Best for longer events with variable consumption
//                     </div>
//                   </div>
                  
//                   <div className={`p-4 rounded ${quoteResult.recommendedModel === 'Hybrid Model' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
//                     <div className="font-semibold mb-2">Hybrid Model</div>
//                     <div className="text-2xl font-bold mb-2">
//                       {formatCurrency(calculateHybridModelPrice(duration, guestCount, formData))}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Best for medium-sized events with base requirements
//                     </div>
//                   </div>
//                 </div>
  
//                 <div className="mt-4 text-sm text-gray-600">
//                   <p>Recommended: <span className="font-semibold text-green-600">{quoteResult.recommendedModel}</span></p>
//                   <p className="mt-1">
//                     This recommendation is based on your event size, duration, and selected services.
//                   </p>
//                 </div>
//               </div>
  
//               {/* Detailed Price Breakdown */}
//               <div className="py-4">
//                 <h4 className="font-semibold mb-4">Detailed Price Breakdown</h4>
                
//                 <div className="space-y-8">
//                   {/* By-the-Cup Breakdown */}
//                   <div className="border rounded-lg p-4">
//                     <h5 className="font-semibold mb-3">By-the-Cup Model Breakdown</h5>
//                     {byTheCupBreakdown.map((section, index) => (
//                       <div key={index} className="mb-4">
//                         <h6 className="font-medium text-sm text-gray-700 mb-2">{section.category}</h6>
//                         {section.items.map((item, itemIndex) => (
//                           <div key={itemIndex} className="flex justify-between text-sm py-1">
//                             <div className="flex-1">
//                               <div>{item.label}</div>
//                               {item.details && (
//                                 <div className="text-gray-500 text-xs">{item.details}</div>
//                               )}
//                             </div>
//                             <div className="ml-4">{formatCurrency(item.amount)}</div>
//                           </div>
//                         ))}
//                         <div className="flex justify-between font-medium text-sm pt-2 border-t mt-2">
//                           <span>Subtotal</span>
//                           <span>{formatCurrency(section.subtotal)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
  
//                   {/* Hourly Rate Breakdown */}
//                   <div className="border rounded-lg p-4">
//                     <h5 className="font-semibold mb-3">Hourly Rate Model Breakdown</h5>
//                     {hourlyRateBreakdown.map((section, index) => (
//                       <div key={index} className="mb-4">
//                         <h6 className="font-medium text-sm text-gray-700 mb-2">{section.category}</h6>
//                         {section.items.map((item, itemIndex) => (
//                           <div key={itemIndex} className="flex justify-between text-sm py-1">
//                             <div className="flex-1">
//                               <div>{item.label}</div>
//                               {item.details && (
//                                 <div className="text-gray-500 text-xs">{item.details}</div>
//                               )}
//                             </div>
//                             <div className="ml-4">{formatCurrency(item.amount)}</div>
//                           </div>
//                         ))}
//                         <div className="flex justify-between font-medium text-sm pt-2 border-t mt-2">
//                           <span>Subtotal</span>
//                           <span>{formatCurrency(section.subtotal)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
  
//                   {/* Hybrid Model Breakdown */}
//                   <div className="border rounded-lg p-4">
//                     <h5 className="font-semibold mb-3">Hybrid Model Breakdown</h5>
//                     {hybridBreakdown.map((section, index) => (
//                       <div key={index} className="mb-4">
//                         <h6 className="font-medium text-sm text-gray-700 mb-2">{section.category}</h6>
//                         {section.items.map((item, itemIndex) => (
//                           <div key={itemIndex} className="flex justify-between text-sm py-1">
//                             <div className="flex-1">
//                               <div>{item.label}</div>
//                               {item.details && (
//                                 <div className="text-gray-500 text-xs">{item.details}</div>
//                               )}
//                             </div>
//                             <div className="ml-4">{formatCurrency(item.amount)}</div>
//                           </div>
//                         ))}
//                         <div className="flex justify-between font-medium text-sm pt-2 border-t mt-2">
//                           <span>Subtotal</span>
//                           <span>{formatCurrency(section.subtotal)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
  
//               {/* Rest of the existing content */}
//               {/* Timeline */}
//               <div className="border-t border-gray-200 py-4">
//                 <h4 className="font-semibold mb-4">Event Timeline</h4>
//                 <div className="grid grid-cols-[auto,1fr] gap-4">
//                   {generateTimelinePoints(formData.eventTime, parseInt(formData.eventDuration), bookedAddOns)
//                     .map((point, index, array) => (
//                       <React.Fragment key={index}>
//                         <div className="text-sm font-medium">{point.time}</div>
//                         <div className="text-sm">
//                           {point.events.length > 0 ? (
//                             point.events.map((event, eventIndex) => (
//                               <div key={eventIndex} className="text-green-600">
//                                 {event.service}
//                               </div>
//                             ))
//                           ) : (
//                             <div className="text-gray-600">
//                               {index === 0 ? 'Setup' : 
//                                index === array.length - 1 ? 'Teardown' : 
//                                'Regular Service'}
//                             </div>
//                           )}
//                         </div>
//                       </React.Fragment>
//                     ))}
//                 </div>
//               </div>
  
//               {/* Special Requests */}
//               {(formData.customDrink || formData.specialInstructions) && (
//                 <div className="border-t border-gray-200 py-4">
//                   <h4 className="font-semibold mb-4">Special Requests</h4>
//                   {formData.customDrink && (
//                     <div className="mb-4">
//                       <h5 className="text-sm font-medium mb-2">Custom Drink:</h5>
//                       <p className="text-sm text-gray-600">{formData.customDrink}</p>
//                     </div>
//                   )}
//                   {formData.specialInstructions && (
//                     <div>
//                       <h5 className="text-sm font-medium mb-2">Special Instructions:</h5>
//                       <p className="text-sm text-gray-600">{formData.specialInstructions}</p>
//                     </div>
//                   )}
//                 </div>
//               )}
  
//               {/* Total */}
//               <div className="border-t border-gray-200 pt-4">
//                 <div className="flex justify-between items-center text-lg">
//                   <span className="font-semibold">Recommended Total Price:</span>
//                   <span className="font-bold text-xl text-green-600">
//                     {formatCurrency(quoteResult.totalPrice)}
//                   </span>
//                 </div>
//               </div>
  
//               {/* Notes */}
//               <div className="text-sm text-gray-500 space-y-1 mt-4">
//                 <p>* All prices are estimates and subject to final confirmation</p>
//                 <p>* Additional charges may apply based on final event requirements</p>
//                 <p>* Travel fees may apply based on event location</p>
//                 <p>* Prices include standard setup and teardown time</p>
//                 <p>* Minimum notice of 48 hours required for any changes</p>
//               </div>
  
//               {/* Actions */}
//               <div className="mt-8 flex justify-end space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => window.print()}
//                   className="flex items-center"
//                 >
//                   Print Quote
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     if (validateDates(formData.eventDate)) {
//                       setAlertMessage('Thank you for your booking! We will contact you shortly to confirm details.');
//                       setShowAlert(true);
//                       setTimeout(() => setShowAlert(false), 5000);
//                     } else {
//                       setAlertMessage('Please select a valid future date for your event.');
//                       setShowAlert(true);
//                       setTimeout(() => setShowAlert(false), 5000);
//                     }
//                   }}
//                   className="flex items-center"
//                 >
//                   Accept Quote
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold mb-2">Event Planner</h1>
//         <p className="text-gray-600">Plan your perfect coffee service event</p>
//       </div>

//       <div className="mb-8 flex justify-between">
//         {[1, 2, 3, 4].map(step => (
//           <Button
//             key={step}
//             variant={currentStep === step ? 'default' : 'outline'}
//             onClick={() => {
//               if (validateStep(currentStep)) {
//                 setCurrentStep(step);
//               }
//             }}
//             className={`w-[calc(25%-12px)]`}
//           >
//             {step === 1 && <Calendar className="w-4 h-4 mr-2" />}
//             {step === 2 && <Coffee className="w-4 h-4 mr-2" />}
//             {step === 3 && <User className="w-4 h-4 mr-2" />}
//             {step === 4 && <MapPin className="w-4 h-4 mr-2" />}
//             Step {step}
//           </Button>
//         ))}
//       </div>

//       <div className="mb-8">
//         {currentStep === 1 && renderEventDetails()}
//         {currentStep === 2 && renderMenuSelection()}
//         {currentStep === 3 && renderAdditionalServices()}
//         {currentStep === 4 && renderSpecialRequests()}
//         {currentStep === 5 && renderQuoteResult()}
//       </div>

//       <div className="flex justify-between">
//         {currentStep > 1 && (
//           <Button
//             variant="outline"
//             onClick={() => setCurrentStep(curr => curr - 1)}
//           >
//             Previous
//           </Button>
//         )}
        
//         {currentStep < 4 ? (
//           <Button
//             onClick={() => {
//               if (validateStep(currentStep)) {
//                 setCurrentStep(curr => curr + 1);
//               }
//             }}
//           >
//             Next
//           </Button>
//         ) : currentStep === 4 ? (
//           <Button onClick={calculateQuote}>
//             Calculate Quote
//           </Button>
//         ) : null}
//       </div>

//       {showAlert && (
//         <Alert className="fixed bottom-4 right-4">
//           <AlertDescription>{alertMessage}</AlertDescription>
//         </Alert>
//       )}
//     </div>

//   );
// };

// export default EventPlanner;