
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Droplet,
  Users,
  Heart,
  Leaf,
  Link2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Cause } from '@/types';

interface CauseDetailsSidebarProps {
  cause: Cause;
}

const Icons: Record<string, () => JSX.Element> = {
  droplet: () => <Droplet className="w-6 h-6" />,
  users: () => <Users className="w-6 h-6" />,
  heart: () => <Heart className="w-6 h-6" />,
  leaf: () => <Leaf className="w-6 h-6" />
};

const CauseDetailsSidebar = ({ cause }: CauseDetailsSidebarProps) => {
  return (
    <div className="md:col-span-1 space-y-4">
      {/* Cause Details Card */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Cause Details</h2>
          <div className="flex items-center gap-2">
            {Icons[cause.category] ? Icons[cause.category]() : <Heart className="w-6 h-6" />}
            <span>{cause.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>Global</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Published {format(new Date(cause.createdAt), 'PPP', { locale: enUS })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Updated {formatDistanceToNow(new Date(cause.updatedAt), { addSuffix: true, locale: enUS })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-500" />
            <a href="#" className="text-blue-500 hover:underline">
              Visit Website <ExternalLink className="w-3 h-3 inline-block ml-1" />
            </a>
          </div>
          <div>
            <Badge variant="secondary">
              {cause.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Card */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Sponsors</h2>
          {cause.sponsors && cause.sponsors.length > 0 ? (
            <ul className="space-y-2">
              {cause.sponsors.map((sponsor) => (
                <li key={sponsor._id || Math.random().toString()} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{sponsor.name ? sponsor.name.charAt(0) : 'S'}</AvatarFallback>
                  </Avatar>
                  <span>{sponsor.name || 'Anonymous Sponsor'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sponsors yet. Be the first!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CauseDetailsSidebar;
