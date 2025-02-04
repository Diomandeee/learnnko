// // src/components/coffee-shops/map/destination-reached.tsx
// "use client"

// import { motion, AnimatePresence } from "framer-motion"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import {
//   MapPin,
//   Check,
//   ArrowRight,
//   Building,
//   Phone,
//   Mail,
//   DollarSign,
//   Clock,
// } from "lucide-react"

// export function DestinationReached({ 
//   show,
//   location,
//   onMarkVisited,
//   onSkip,
//   arrivalTime
// }) {
//   // Animation variants
//   const overlayVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 }
//   }

//   const cardVariants = {
//     hidden: { 
//       opacity: 0, 
//       scale: 0.8,
//       y: 50 
//     },
//     visible: { 
//       opacity: 1, 
//       scale: 1,
//       y: 0,
//       transition: {
//         type: "spring",
//         damping: 25,
//         stiffness: 300
//       }
//     },
//     exit: {
//       opacity: 0,
//       scale: 0.8,
//       y: 50
//     }
//   }

//   const iconVariants = {
//     hidden: { scale: 0 },
//     visible: { 
//       scale: 1,
//       transition: {
//         type: "spring",
//         damping: 10,
//         stiffness: 200,
//         delay: 0.2
//       }
//     }
//   }

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           exit="hidden"
//           variants={overlayVariants}
//           className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//         >
//           <motion.div
//             variants={cardVariants}
//             className="w-full max-w-md"
//           >
//             <Card className="border-2 border-primary">
//               <CardContent className="p-6">
//                 <div className="text-center space-y-6">
//                   {/* Icon */}
//                   <motion.div
//                     variants={iconVariants}
//                     className="mx-auto"
//                   >
//                     <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
//                       <MapPin className="h-8 w-8 text-primary" />
//                     </div>
//                   </motion.div>

//                   {/* Arrival Message */}
//                   <div className="space-y-2">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.3 }}
//                       className="space-y-1"
//                     >
//                       <h2 className="text-2xl font-semibold">
//                         You've Arrived!
//                       </h2>
//                       <p className="text-muted-foreground">
//                         {arrivalTime}
//                       </p>
//                     </motion.div>
//                   </div>

//                   {/* Location Details */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.4 }}
//                     className="space-y-4"
//                   >
//                     <Card>
//                       <CardContent className="p-4 space-y-3">
//                         <h3 className="font-medium text-lg">{location.title}</h3>
//                         <p className="text-sm text-muted-foreground">{location.address}</p>
                        
//                         <div className="grid grid-cols-1 gap-2 pt-2">
//                           {location.volume && (
//                             <div className="flex items-center gap-2 text-sm">
//                               <DollarSign className="h-4 w-4 text-muted-foreground" />
//                               <span>
//                                 Volume: {location.volume} | ARR: ${((parseFloat(location.volume) * 52) * 18).toLocaleString()}
//                               </span>
//                             </div>
//                           )}
//                           {location.manager_present && (
//                             <div className="flex items-center gap-2 text-sm">
//                               <Building className="h-4 w-4 text-muted-foreground" />
//                               <span>Manager: {location.manager_present}</span>
//                             </div>
//                           )}
//                           {location.phone && (
//                             <div className="flex items-center gap-2 text-sm">
//                               <Phone className="h-4 w-4 text-muted-foreground" />
//                               <span>{location.phone}</span>
//                             </div>
//                           )}
//                           {location.contact_email && (
//                             <div className="flex items-center gap-2 text-sm">
//                               <Mail className="h-4 w-4 text-muted-foreground" />
//                               <span>{location.contact_email}</span>
//                             </div>
//                           )}
//                         </div>

//                         {location.visited ? (
//                           <Badge variant="success" className="mt-2">Previously Visited</Badge>
//                         ) : (
//                           <Badge variant="secondary" className="mt-2">New Location</Badge>
//                         )}
//                       </CardContent>
//                     </Card>

//                     <div className="flex flex-col gap-2 pt-2">
//                       <Button 
//                         onClick={onMarkVisited}
//                         className="w-full"
//                         size="lg"
//                       >
//                         <Check className="mr-2 h-4 w-4" />
//                         Mark as Visited
//                       </Button>
//                       <Button 
//                         variant="outline"
//                         onClick={onSkip}
//                         className="w-full"
//                         size="lg"
//                       >
//                         <ArrowRight className="mr-2 h-4 w-4" />
//                         Skip Location
//                       </Button>
//                     </div>
//                   </motion.div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   )
// }