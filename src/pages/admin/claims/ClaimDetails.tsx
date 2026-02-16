// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { format } from 'date-fns';
// import AdminLayout from '@/components/admin/AdminLayout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Loader2, ArrowLeft, MapPin, Mail, Phone } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';

// interface ClaimDetails {
//   _id: string;
//   causeId: string;
//   causeTitle: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   purpose: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   status: string;
//   emailVerified: boolean;
//   createdAt: string;
//   updatedAt: string;
//   shippingDate?: string;
//   deliveryDate?: string;
// }

// const ClaimDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const { data: claim, isLoading, error } = useQuery<ClaimDetails>({
//     queryKey: ['claim', id],
//     queryFn: async () => {
//       const response = await axios.get(`/api/claims/${id}`);
//       return response.data;
//     },
//   });

//   const handleStatusChange = async (newStatus: string) => {
//     try {
//       await axios.patch(`/api/claims/${id}/status`, { status: newStatus });
//       toast({
//         title: 'Status Updated',
//         description: 'The claim status has been successfully updated.',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to update claim status.',
//         variant: 'destructive',
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <AdminLayout>
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (error || !claim) {
//     return (
//       <AdminLayout>
//         <div className="text-center text-red-600 py-8">
//           Error loading claim details
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         <div className="flex items-center gap-4">
//           <Button
//             variant="ghost"
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back
//           </Button>
//           <h1 className="text-2xl font-bold">Claim Details</h1>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="md:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Cause Information</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="font-semibold">{claim.causeTitle}</h3>
//                     <p className="text-sm text-gray-500">
//                       Claimed on {format(new Date(claim.createdAt), 'PPP')}
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium mb-2">Purpose</h4>
//                     <p className="text-gray-700">{claim.purpose}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Claimer Information</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="font-semibold">{claim.fullName}</h3>
//                     <div className="flex items-center gap-4 mt-2">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <Mail className="h-4 w-4" />
//                         {claim.email}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <Phone className="h-4 w-4" />
//                         {claim.phone}
//                       </div>
//                     </div>
//                   </div>
//                   <Separator />
//                   <div>
//                     <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
//                     <div className="flex items-start gap-2 text-gray-700">
//                       <MapPin className="h-4 w-4 mt-1" />
//                       <div>
//                         <p>{claim.address}</p>
//                         <p>{claim.city}, {claim.state} {claim.zipCode}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Status</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <Select
//                     defaultValue={claim.status}
//                     onValueChange={handleStatusChange}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="verified">Verified</SelectItem>
//                       <SelectItem value="shipped">Shipped</SelectItem>
//                       <SelectItem value="delivered">Delivered</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>

//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Email Verified</span>
//                       <Badge variant={claim.emailVerified ? 'default' : 'secondary'}>
//                         {claim.emailVerified ? 'Yes' : 'No'}
//                       </Badge>
//                     </div>
//                     {claim.shippingDate && (
//                       <div className="flex justify-between text-sm">
//                         <span>Shipped Date</span>
//                         <span>{format(new Date(claim.shippingDate), 'PP')}</span>
//                       </div>
//                     )}
//                     {claim.deliveryDate && (
//                       <div className="flex justify-between text-sm">
//                         <span>Delivery Date</span>
//                         <span>{format(new Date(claim.deliveryDate), 'PP')}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <Button className="w-full" variant="outline">
//                     Send Email
//                   </Button>
//                   <Button className="w-full" variant="outline">
//                     Print Shipping Label
//                   </Button>
//                   <Button className="w-full" variant="outline">
//                     View Cause Details
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default ClaimDetails; 